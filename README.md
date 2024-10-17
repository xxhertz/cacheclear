# FAQ

## What is cacheclear?
A simple script to delete common shadercache, forcing games & applications to re-compile shaders, sometimes resulting in an increase in framerate & performance overall

## How do I use it?

1. Clone this repository
###### 
	git clone https://github.com/xxhertz/cacheclear
2. Install deno
######
	irm https://deno.land/install.ps1 | iex
3. Install dependencies
######
	deno i --allow-scripts

4. Run main.ts
######
	deno task clearcache