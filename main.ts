import registryjs from "registry-js"
import { assert } from "@std/assert"
import * as path from "@std/path"
import * as VDF from "@node-steam/vdf"

assert(Deno.build.os === "windows", "This program only supports windows machines")

type VDFLibraryFolder = Partial<{
	path: string
	label: string
	contentid: number
	totalsize: number
	update_clean_bytes_tally: number,
	time_last_update_corruption: number,
	apps: Record<string, number>
}>

type VDFFormat = Partial<{
	libraryfolders: Record<string, VDFLibraryFolder>
}>

const handleSteam = async () => {
	const steamPath = registryjs.enumerateValues(registryjs.HKEY.HKEY_LOCAL_MACHINE, "SOFTWARE\\WOW6432Node\\Valve\\Steam").find(key => key.name === "InstallPath")
	if (steamPath === undefined || typeof steamPath.data !== "string")
		return console.log("Could not find steam path, skipping Steam cleanup")

	console.log(`Found steam directory: ${steamPath.data}`)
	console.log("Getting SteamLibrary directories")

	const libraryFolders = path.join(steamPath.data, "steamapps", "libraryfolders.vdf")
	const parsed = VDF.parse(Deno.readTextFileSync(libraryFolders)) as VDFFormat
	if (!parsed || !parsed.libraryfolders)
		return console.log("Could not parse SteamLibrary directories, skipping Steam cleanup")

	const folders = Object.values(parsed.libraryfolders).map(folder => folder.path).filter(folderPath => folderPath !== undefined)
	folders.map(async folderPath => {
		console.log(`Found folder path: ${folderPath}`)

		const shaderCache = path.join(folderPath, "steamapps", "shadercache")
		try {
			const apps = [...Deno.readDirSync(shaderCache)].map(app => app.isDirectory ? app.name : undefined).filter(app => app !== undefined)
			console.log(`Found ${apps.length} shadercache folders, deleting shadercache/${apps.join("|")}`)
			await Promise.allSettled(apps.map(app => Deno.remove(path.join(shaderCache, app), { recursive: true })))
			const leftOver = [...Deno.readDirSync(shaderCache)].length
			console.log(`Removed ${apps.length - leftOver} shadercache folders from ${folderPath}`)
		} catch {
			console.log(`No shadercache in ${folderPath}, skipping`)
		}
	})

	await Promise.all(folders)
}

handleSteam()
