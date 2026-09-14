import test from "node:test"; import assert from "node:assert/strict"; import { handleMcp } from "../src/mcp-server.js";
const graph={assets:[{id:"a",criticality:5,internetExposed:true,tags:[]}],findings:[{id:"f",assetId:"a",severity:8,exploitability:.5,status:"open"}],edges:[]};
test("MCP initialize",()=>{assert.equal(handleMcp({id:1,method:"initialize"}).result.serverInfo.name,"shpbl-counterfactual-exposure-planner");});
test("MCP lists three tools",()=>{assert.equal(handleMcp({id:1,method:"tools/list"}).result.tools.length,3);});
test("MCP simulates structured result",()=>{const r=handleMcp({id:1,method:"tools/call",params:{name:"exposure_simulate",arguments:{graph,scenario:{id:"p",interventions:[{kind:"PATCH_FINDING",findingId:"f"}]}}}});assert.equal(r.result.structuredContent.scenarioId,"p");});
test("MCP rejects unknown tool",()=>{assert.match(handleMcp({id:1,method:"tools/call",params:{name:"wat",arguments:{graph}}}).error.message,/E_TOOL/);});
