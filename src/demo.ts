import "./demo.css"

import { mount } from "svelte"

import Demo from "./Demo.svelte"

const demo = mount(Demo, { target: document.getElementById("demo")! })
export default demo
