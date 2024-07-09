var X=Object.defineProperty;var q=(e,t,o)=>t in e?X(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o;var x=(e,t,o)=>(q(e,typeof t!="symbol"?t+"":t,o),o);import{j as jsxRuntimeExports,u as useSelector,a as useDispatch,r as reactExports,d as dist,b as defaultsDeep,c as createSlice,R,C as Color,p as partition,e as createSelector,f as del,g as update,s as setMany,h as entries,i as ut,k as useCombobox,l as React,S as StateManagedSelect$1,m as dist$1,F as FontAwesomeIcon,n as faLightbulb,o as faHeadphones,q as faDisplay,t as faMicrochip,v as createListenerMiddleware,w as captureException,x as createReduxEnhancer,y as configureStore,z as faBook,A as faUndo,B as faSave,D as faTrash,E as faCompress,G as faExpand,H as faMagicWandSparkles,I as faStopwatch,J as faSquare,K as faCircle,L as faXmarkCircle,M as ReactTextareaAutocomplete,N as faClapperboard,O as faCode,P as faFloppyDisk,Q as stringify,T as faAngleDown,U as faPlus,V as faUpload,W as faXmark,X as faToolbox,Y as useProgress,Z as faCircleQuestion,_ as faWarning,$ as useLocation,a0 as Link$1,a1 as faComputer,a2 as faCancel,a3 as faDownload,a4 as faKeyboard,a5 as faStethoscope,a6 as faBrush,a7 as faGear,a8 as faBug,a9 as faDiscord,aa as faGithub,ab as useResizeObserver,ac as useThree,ad as useSpring,ae as useFrame,af as PerspectiveCamera,ag as shallowEqual,ah as Shape,ai as animated,aj as Html,ak as useGLTF,al as Segments,am as Segment,an as PresentationControls,ao as BufferAttribute,ap as Object3D,aq as SpotLight,ar as config,as as Canvas,at as OrbitControls,au as faUnlock,av as faSpinner,aw as dt,ax as Route,ay as ErrorBoundary,az as Provider,aA as init,aB as BrowserTracing,aC as Initialization,aD as createRoot}from"./vendor-d9bccdb7.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function o(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=o(r);fetch(r.href,s)}})();const Fragment=jsxRuntimeExports.Fragment,jsx=jsxRuntimeExports.jsx,jsxs=jsxRuntimeExports.jsxs,style="";var TestKeyState=(e=>(e[e.Initial=0]="Initial",e[e.KeyDown=1]="KeyDown",e[e.KeyUp=2]="KeyUp",e))(TestKeyState||{});let globalAudioContext,globalAmp,globalAmpGain=1;const ampGain=.25,ampAttack=.05,ampDecay=.05,ampSustain=1,ampRelease=.05;function getAudioContext(){return globalAudioContext===void 0&&(globalAudioContext=new AudioContext),globalAudioContext}function getGlobalAmp(){if(globalAmp===void 0){const e=getAudioContext();globalAmp=e.createGain(),globalAmp.gain.value=globalAmpGain,globalAmp.connect(e.destination)}return globalAmp}function setGlobalAmpGain(e){globalAmpGain=e,globalAmp!==void 0&&(globalAmp.gain.setValueAtTime(globalAmp.gain.value,getAudioContext().currentTime),globalAmp.gain.linearRampToValueAtTime(globalAmpGain,getAudioContext().currentTime+.2))}function midiNoteToFrequency(e){let t=440;return Math.pow(2,(e-69)/12)*t}class Note{constructor(t,o){x(this,"audioContext");x(this,"osc");x(this,"amp");x(this,"ampSustainTime");x(this,"midiNote");this.midiNote=t,this.audioContext=getAudioContext(),this.osc=new OscillatorNode(this.audioContext,{type:o,frequency:midiNoteToFrequency(this.midiNote)}),this.ampSustainTime=0,this.amp=this.audioContext.createGain(),this.amp.gain.value=0,this.amp.connect(getGlobalAmp()),this.osc.connect(this.amp)}noteOn(){const t=this.audioContext.currentTime;this.osc.start(t),this.ampSustainTime=t+ampAttack+ampDecay,this.amp.gain.linearRampToValueAtTime(ampGain,t+ampAttack),this.amp.gain.linearRampToValueAtTime(ampGain*ampSustain,this.ampSustainTime)}noteOff(){this.audioContext.currentTime>=this.ampSustainTime&&this.amp.gain.setValueAtTime(ampGain*ampSustain,this.audioContext.currentTime);const t=Math.max(this.audioContext.currentTime,this.ampSustainTime)+ampRelease;this.osc.stop(t),this.amp.gain.linearRampToValueAtTime(0,t)}}const useAppSelector=useSelector,useAppDispatch=useDispatch;var TestKeyboardSoundsMode=(e=>(e[e.Random=0]="Random",e[e.WickiHayden=1]="WickiHayden",e[e.Chromatic=2]="Chromatic",e))(TestKeyboardSoundsMode||{});let lastPressedKeys=[],notes={};const baseSeed=Math.floor(Math.random()*1e3),seededRandom=e=>((baseSeed+e)*9301+49297)%233280/233280,calculateMidiNote=(e,t,o,n,r)=>{const s=Math.min(4,o-n-1)+Math.max(0,5-o);switch(e){case 1:return[-18,-19,-14,-9,-4][s]+72+t+r*2;case 2:return[-15,-12,-7,-1,4][s]+72+t+r;case 0:default:return 72+t+Math.floor(seededRandom(n*1e3+r)*24)-12}},turnOffAllTheNotes=()=>{Object.values(notes).forEach(e=>e==null?void 0:e.noteOff())},TestKeyboardSounds=({pressedKeys:e})=>{const{waveform:t,volume:o,mode:n,transpose:r}=useAppSelector(getTestKeyboardSoundsSettings);return reactExports.useEffect(()=>{setGlobalAmpGain(o/100)},[o]),reactExports.useEffect(()=>{if(e.length===0)turnOffAllTheNotes();else{const s=e.length;lastPressedKeys=e.reduce((a,i,c)=>[...a,i.reduce((l,d,u)=>{var p,K;const C=`${c},${u}`,_=((p=lastPressedKeys==null?void 0:lastPressedKeys.at(c))==null?void 0:p.at(u))??TestKeyState.KeyUp,h=d??TestKeyState.KeyUp;if(h!=_)if(h==TestKeyState.KeyDown){const g=calculateMidiNote(n,r,s,c,u);notes[C]=new Note(g,t),notes[C].noteOn()}else h==TestKeyState.KeyUp&&((K=notes[C])==null||K.noteOff());return[...l,d]},[])],[])}},[e]),reactExports.useEffect(()=>()=>{turnOffAllTheNotes()},[]),null},THEMES={OLIVIA_DARK:{alpha:{c:"#363434",t:"#E8C4B8"},mod:{c:"#363434",t:"#E8C4B8"},accent:{c:"#E8C4B8",t:"#363434"}},OLIVE:{alpha:{t:"#66665A",c:"#D9D7C4"},mod:{c:"#66665A",t:"#9DA183"},accent:{c:"#9DA183",t:"#66665A"}},OLIVE_DARK:{alpha:{c:"#66665A",t:"#9DA183"},mod:{c:"#66665A",t:"#9DA183"},accent:{c:"#9DA183",t:"#66665A"}},OLNY:{alpha:{c:"#c20018",t:"#cfa174"},mod:{c:"#c20018",t:"#cfa174"},accent:{t:"#c20018",c:"#cfa174"}},GREG:{alpha:{c:"#f8c200",t:"#393b3b"},mod:{c:"#f7f2ea",t:"#393b3b"},accent:{c:"#171718",t:"#393b3b"}},CARBON_BLACK_A:{alpha:{c:"#788194",t:"#f3f3f3"},mod:{c:"#3b3b3e",t:"#f3f3f3"},accent:{c:"#e66b67",t:"#f3f3f3"}},CARBON_BLACK_B:{alpha:{c:"#3b3b3e",t:"#f3f3f3"},mod:{c:"#788194",t:"#f3f3f3"},accent:{c:"#e66b67",t:"#f3f3f3"}},SILVER_GREY_A:{alpha:{c:"#b2b3b8",t:"#f3f3f3"},mod:{c:"#838589",t:"#f3f3f3"},accent:{c:"#e8db5d",t:"#3d3125"}},SILVER_GREY_B:{alpha:{c:"#838589",t:"#f3f3f3"},mod:{c:"#b2b3b8",t:"#f3f3f3"},accent:{c:"#e8db5d",t:"#3d3125"}},NAVY_BLUE_A:{alpha:{c:"#547be8",t:"#f3f3f3"},mod:{c:"#49599f",t:"#f3f3f3"},accent:{c:"#4dcfe0",t:"#f3f3f3"}},NAVY_BLUE_B:{alpha:{c:"#49599f",t:"#f3f3f3"},mod:{c:"#547be8",t:"#f3f3f3"},accent:{c:"#4dcfe0",t:"#f3f3f3"}},FENDAI:{alpha:{c:"#f0ebec",t:"#07010f"},mod:{c:"#f0ebec",t:"#56395c"},accent:{c:"#fc5d75",t:"#56395c"}},HONEY_MILK:{alpha:{c:"#fffff8",t:"#07010f"},mod:{c:"#fffff8",t:"#07010f"},accent:{c:"#f8b140",t:"#07010f"}},MATCHA:{alpha:{c:"#e8e8df",t:"#4e475c"},mod:{c:"#828572",t:"#4e475c"},accent:{c:"#828572",t:"#4e475c"}},BLACK_GREY:{alpha:{c:"#7e8293",t:"#a5cbe6"},mod:{c:"#364352",t:"#eff3f2"},accent:{c:"#364352",t:"#eff3f2"}},WHITE_GREEN:{alpha:{c:"#fefefe",t:"#272727"},mod:{c:"#275c65",t:"#d0eae8"},accent:{c:"#275c65",t:"#d0eae8"}},WHITE:{alpha:{c:"#fefefe",t:"#272727"},mod:{c:"#fefefe",t:"#272727"},accent:{c:"#fefefe",t:"#272727"}},BLACK:{alpha:{c:"#272727",t:"#fefefe"},mod:{c:"#272727",t:"#fefefe"},accent:{c:"#272727",t:"#fefefe"}},BLACK_AND_WHITE:{alpha:{c:"#fefefe",t:"#272727"},mod:{c:"#272727",t:"#fefefe"},accent:{c:"#272727",t:"#fefefe"}},CLASSIC_GREY:{alpha:{c:"#fcfcfc",t:"#1a1a1a"},mod:{c:"#a0a0a0",t:"#1a1a1a"},accent:{c:"#a0a0a0",t:"#1a1a1a"}},...dist.THEMES};class Store{constructor(t){x(this,"store");const o=localStorage.getItem("via-app-store");this.store=o?defaultsDeep(JSON.parse(o),t):t}get(t){return this.store[t]}set(t,o){const n={...this.store,[t]:{...o}};this.store=n,setTimeout(()=>{localStorage.setItem("via-app-store",JSON.stringify(n))},0)}}const entryLog=[],logCommand=(e,t,o)=>{entryLog.push({kbAddr:e,request:t,response:o,ts:Date.now()})},getLog=window.__getLogs=()=>entryLog;window.addEventListener("message",e=>{e.data.command==="fetchLogs"&&window.postMessage({command:"getLogs",payload:getLog()},"*")});const globalBuffer={},eventWaitBuffer={},filterHIDDevices=e=>e.filter(t=>{var o;return(o=t.collections)==null?void 0:o.some(n=>n.usage===97&&n.usagePage===65376)}),getVIAPathIdentifier=()=>self.crypto&&self.crypto.randomUUID&&self.crypto.randomUUID()||`via-path:${Math.random()}`,tagDevice=e=>{const t=e.__path||getVIAPathIdentifier();e.__path=t;const o={_device:e,usage:97,usagePage:65376,interface:1,vendorId:e.vendorId??-1,productId:e.productId??-1,path:t,productName:e.productName};return ExtendedHID._cache[t]=o},tryForgetDevice=e=>{const t=ExtendedHID._cache[e.path];if(t)return t._device.forget()},ExtendedHID={_cache:{},requestDevice:async()=>{const e=await navigator.hid.requestDevice({filters:[{usagePage:65376,usage:97}]});return e.forEach(tagDevice),e[0]},getFilteredDevices:async()=>{try{return filterHIDDevices(await navigator.hid.getDevices())}catch{return[]}},devices:async(e=!1)=>{let t=await ExtendedHID.getFilteredDevices();if(t.length===0||e){try{await ExtendedHID.requestDevice()}catch{return[]}t=await ExtendedHID.getFilteredDevices()}return t.map(tagDevice)},HID:class{constructor(t){x(this,"_hidDevice");x(this,"interface",-1);x(this,"vendorId",-1);x(this,"productId",-1);x(this,"productName","");x(this,"path","");x(this,"openPromise",Promise.resolve());x(this,"readP",promisify(t=>this.read(t)));if(this._hidDevice=ExtendedHID._cache[t],this._hidDevice)this.vendorId=this._hidDevice.vendorId,this.productId=this._hidDevice.productId,this.path=this._hidDevice.path,this.interface=this._hidDevice.interface,this.productName=this._hidDevice.productName,globalBuffer[this.path]=globalBuffer[this.path]||[],eventWaitBuffer[this.path]=eventWaitBuffer[this.path]||[],this._hidDevice._device.opened||this.open();else throw new Error("Missing hid device in cache")}async open(){return this._hidDevice&&!this._hidDevice._device.opened&&(this.openPromise=this._hidDevice._device.open(),this.setupListeners(),await this.openPromise),Promise.resolve()}setupListeners(){this._hidDevice&&this._hidDevice._device.addEventListener("inputreport",t=>{eventWaitBuffer[this.path].length!==0?eventWaitBuffer[this.path].shift()(new Uint8Array(t.data.buffer)):globalBuffer[this.path].push({currTime:Date.now(),message:new Uint8Array(t.data.buffer)})})}read(t){var o;this.fastForwardGlobalBuffer(Date.now()),globalBuffer[this.path].length>0?t(void 0,(o=globalBuffer[this.path].shift())==null?void 0:o.message):eventWaitBuffer[this.path].push(n=>t(void 0,n))}fastForwardGlobalBuffer(t){let o=globalBuffer[this.path].length;for(;o&&(o--,globalBuffer[this.path][0].currTime<t);)globalBuffer[this.path].shift()}async write(t){var n;await this.openPromise;const o=new Uint8Array(t.slice(1));await((n=this._hidDevice)==null?void 0:n._device.sendReport(0,o))}}},promisify=e=>()=>new Promise((t,o)=>{e((n,r)=>{n?o(n):t(r)})}),HID=ExtendedHID,B=class B{static startMonitoring(){this.shouldMonitor=!0,!this.hasMonitored&&navigator.hid&&(navigator.hid.addEventListener("connect",B.onConnect),navigator.hid.addEventListener("disconnect",B.onDisconnect))}static stopMonitoring(){this.shouldMonitor=!1}static on(t,o){this._listeners[t]=[...this._listeners[t],o]}static off(t,o){this._listeners[t]=this._listeners[t].filter(n=>n!==o)}};x(B,"_listeners",{change:[],remove:[]}),x(B,"shouldMonitor",!1),x(B,"hasMonitored",!1),x(B,"onConnect",({device:t})=>{console.log("Detected Connection"),B.shouldMonitor&&B._listeners.change.forEach(o=>o(t))}),x(B,"onDisconnect",({device:t})=>{console.log("Detected Disconnection"),B.shouldMonitor&&(B._listeners.change.forEach(o=>o(t)),B._listeners.remove.forEach(o=>o(t)))});let usbDetect=B;async function scanDevices(e){return HID.devices(e)}function initAndConnectDevice({path:e}){return new HID.HID(e)}function startMonitoring(){usbDetect.startMonitoring()}const extractDeviceInfo=e=>({productId:e.productId,vendorId:e.vendorId,productName:e.productName,protocol:e.protocol}),initialState$7={appErrors:[]},getErrorTimestamp=()=>{const e=new Date;return`${e.toLocaleTimeString([],{hour12:!1})}.${e.getMilliseconds().toString().padStart(3,"0")}`},extractMessageFromKeyboardAPIError=e=>`Command Name: ${e.commandName}
Command: ${formatBytes(e.commandBytes)}
Response: ${formatBytes(e.responseBytes)}`,getMessageFromError=e=>e.stack||e.message,formatBytes=e=>e.join(" "),errorsSlice=createSlice({name:"errors",initialState:initialState$7,reducers:{logAppError:(e,t)=>{e.appErrors.push({...t.payload,timestamp:getErrorTimestamp()})},logKeyboardAPIError:(e,t)=>{const{deviceInfo:o}=t.payload;e.appErrors.push({timestamp:getErrorTimestamp(),message:extractMessageFromKeyboardAPIError(t.payload),deviceInfo:o})},clearAppErrors:e=>{e.appErrors=[]}}}),{logKeyboardAPIError,logAppError,clearAppErrors}=errorsSlice.actions,errorsReducer=errorsSlice.reducer,getAppErrors=e=>e.errors.appErrors,COMMAND_START=0,PER_KEY_RGB_CHANNEL_COMMAND=[0,1];var APICommand=(e=>(e[e.GET_PROTOCOL_VERSION=1]="GET_PROTOCOL_VERSION",e[e.GET_KEYBOARD_VALUE=2]="GET_KEYBOARD_VALUE",e[e.SET_KEYBOARD_VALUE=3]="SET_KEYBOARD_VALUE",e[e.DYNAMIC_KEYMAP_GET_KEYCODE=4]="DYNAMIC_KEYMAP_GET_KEYCODE",e[e.DYNAMIC_KEYMAP_SET_KEYCODE=5]="DYNAMIC_KEYMAP_SET_KEYCODE",e[e.CUSTOM_MENU_SET_VALUE=7]="CUSTOM_MENU_SET_VALUE",e[e.CUSTOM_MENU_GET_VALUE=8]="CUSTOM_MENU_GET_VALUE",e[e.CUSTOM_MENU_SAVE=9]="CUSTOM_MENU_SAVE",e[e.EEPROM_RESET=10]="EEPROM_RESET",e[e.BOOTLOADER_JUMP=11]="BOOTLOADER_JUMP",e[e.DYNAMIC_KEYMAP_MACRO_GET_COUNT=12]="DYNAMIC_KEYMAP_MACRO_GET_COUNT",e[e.DYNAMIC_KEYMAP_MACRO_GET_BUFFER_SIZE=13]="DYNAMIC_KEYMAP_MACRO_GET_BUFFER_SIZE",e[e.DYNAMIC_KEYMAP_MACRO_GET_BUFFER=14]="DYNAMIC_KEYMAP_MACRO_GET_BUFFER",e[e.DYNAMIC_KEYMAP_MACRO_SET_BUFFER=15]="DYNAMIC_KEYMAP_MACRO_SET_BUFFER",e[e.DYNAMIC_KEYMAP_MACRO_RESET=16]="DYNAMIC_KEYMAP_MACRO_RESET",e[e.DYNAMIC_KEYMAP_GET_LAYER_COUNT=17]="DYNAMIC_KEYMAP_GET_LAYER_COUNT",e[e.DYNAMIC_KEYMAP_GET_BUFFER=18]="DYNAMIC_KEYMAP_GET_BUFFER",e[e.DYNAMIC_KEYMAP_SET_BUFFER=19]="DYNAMIC_KEYMAP_SET_BUFFER",e[e.DYNAMIC_KEYMAP_GET_ENCODER=20]="DYNAMIC_KEYMAP_GET_ENCODER",e[e.DYNAMIC_KEYMAP_SET_ENCODER=21]="DYNAMIC_KEYMAP_SET_ENCODER",e[e.BACKLIGHT_CONFIG_SET_VALUE=7]="BACKLIGHT_CONFIG_SET_VALUE",e[e.BACKLIGHT_CONFIG_GET_VALUE=8]="BACKLIGHT_CONFIG_GET_VALUE",e[e.BACKLIGHT_CONFIG_SAVE=9]="BACKLIGHT_CONFIG_SAVE",e))(APICommand||{});const APICommandValueToName=Object.entries(APICommand).reduce((e,[t,o])=>({...e,[o]:t}),{});var KeyboardValue=(e=>(e[e.UPTIME=1]="UPTIME",e[e.LAYOUT_OPTIONS=2]="LAYOUT_OPTIONS",e[e.SWITCH_MATRIX_STATE=3]="SWITCH_MATRIX_STATE",e[e.FIRMWARE_VERSION=4]="FIRMWARE_VERSION",e[e.DEVICE_INDICATION=5]="DEVICE_INDICATION",e))(KeyboardValue||{});const BACKLIGHT_BRIGHTNESS=9,BACKLIGHT_EFFECT=10,BACKLIGHT_COLOR_1=12,BACKLIGHT_COLOR_2=13,BACKLIGHT_CUSTOM_COLOR=23,PROTOCOL_ALPHA=7,PROTOCOL_BETA=8,PROTOCOL_GAMMA=9,cache={},eqArr=(e,t)=>e.length!==t.length?!1:e.every((o,n)=>t[n]===o),shiftTo16Bit=([e,t])=>e<<8|t,shiftFrom16Bit=e=>[e>>8,e&255],shiftBufferTo16Bit=e=>{const t=[];for(let o=0;o<e.length;o+=2)t.push(shiftTo16Bit([e[o],e[o+1]]));return t},shiftBufferFrom16Bit=e=>e.map(shiftFrom16Bit).flatMap(t=>t),globalCommandQueue={},canConnect=e=>{try{return new KeyboardAPI(e.path),!0}catch(t){return console.error("Skipped ",e,t),!1}};class KeyboardAPI{constructor(t){x(this,"kbAddr");if(this.kbAddr=t,!cache[t]){const o=initAndConnectDevice({path:t});cache[t]={hid:o}}}refresh(t){this.kbAddr=t,cache[t]={...cache[t],hid:initAndConnectDevice({path:t})}}async getByteBuffer(){return this.getHID().readP()}async getProtocolVersion(){try{const[,t,o]=await this.hidCommand(1);return shiftTo16Bit([t,o])}catch{return-1}}async getKey(t,o,n){const r=await this.hidCommand(4,[t,o,n]);return shiftTo16Bit([r[4],r[5]])}async getLayerCount(){if(await this.getProtocolVersion()>=PROTOCOL_BETA){const[,o]=await this.hidCommand(17);return o}return 4}async readRawMatrix(t,o){const n=await this.getProtocolVersion();if(n>=PROTOCOL_BETA)return this.fastReadRawMatrix(t,o);if(n===PROTOCOL_ALPHA)return this.slowReadRawMatrix(t,o);throw new Error("Unsupported protocol version")}async getKeymapBuffer(t,o){if(o>28)throw new Error("Max data length is 28");return[...await this.hidCommand(18,[...shiftFrom16Bit(t),o])].slice(4,o+4)}async fastReadRawMatrix({rows:t,cols:o},n){const r=t*o,s=14,a=new Array(Math.ceil(r/s)).fill(0),{res:i}=a.reduce(({res:l,remaining:d})=>d<s?{res:[...l,this.getKeymapBuffer(n*r*2+2*(r-d),d*2)],remaining:0}:{res:[...l,this.getKeymapBuffer(n*r*2+2*(r-d),s*2)],remaining:d-s},{res:[],remaining:r});return(await Promise.all(i)).flatMap(shiftBufferTo16Bit)}async slowReadRawMatrix({rows:t,cols:o},n){const r=t*o,s=new Array(r).fill(0).map((a,i)=>this.getKey(n,~~(i/o),i%o));return Promise.all(s)}async writeRawMatrix(t,o){const n=await this.getProtocolVersion();if(n>=PROTOCOL_BETA)return this.fastWriteRawMatrix(o);if(n===PROTOCOL_ALPHA)return this.slowWriteRawMatrix(t,o)}async slowWriteRawMatrix({cols:t},o){o.forEach(async(n,r)=>n.forEach(async(s,a)=>{await this.setKey(r,~~(a/t),a%t,s)}))}async fastWriteRawMatrix(t){const o=t.flatMap(s=>s.map(a=>a)),n=shiftBufferFrom16Bit(o),r=28;for(let s=0;s<n.length;s+=r){const a=n.slice(s,s+r);await this.hidCommand(19,[...shiftFrom16Bit(s),a.length,...a])}}async getKeyboardValue(t,o,n=1){const r=[t,...o];return(await this.hidCommand(2,r)).slice(1+r.length,1+r.length+n)}async setKeyboardValue(t,...o){const n=[t,...o];await this.hidCommand(3,n)}async getEncoderValue(t,o,n){const r=[t,o,+n],s=await this.hidCommand(20,r);return shiftTo16Bit([s[4],s[5]])}async setEncoderValue(t,o,n,r){const s=[t,o,+n,...shiftFrom16Bit(r)];await this.hidCommand(21,s)}async getCustomMenuValue(t){return(await this.hidCommand(8,t)).slice(0+t.length)}async setCustomMenuValue(...t){await this.hidCommand(7,t)}async getPerKeyRGBMatrix(t){return(await Promise.all(t.map(n=>this.hidCommand(8,[...PER_KEY_RGB_CHANNEL_COMMAND,n,1])))).map(n=>[...n.slice(5,7)])}async setPerKeyRGBMatrix(t,o,n){await this.hidCommand(7,[...PER_KEY_RGB_CHANNEL_COMMAND,t,1,o,n])}async getBacklightValue(t,o=1){const n=[t];return(await this.hidCommand(8,n)).slice(2,2+o)}async setBacklightValue(t,...o){const n=[t,...o];await this.hidCommand(7,n)}async getRGBMode(){const t=[BACKLIGHT_EFFECT],[,,o]=await this.hidCommand(8,t);return o}async getBrightness(){const t=[BACKLIGHT_BRIGHTNESS],[,,o]=await this.hidCommand(8,t);return o}async getColor(t){const o=[t===1?BACKLIGHT_COLOR_1:BACKLIGHT_COLOR_2],[,,n,r]=await this.hidCommand(8,o);return{hue:n,sat:r}}async setColor(t,o,n){const r=[t===1?BACKLIGHT_COLOR_1:BACKLIGHT_COLOR_2,o,n];await this.hidCommand(7,r)}async getCustomColor(t){const o=[BACKLIGHT_CUSTOM_COLOR,t],[,,,n,r]=await this.hidCommand(8,o);return{hue:n,sat:r}}async setCustomColor(t,o,n){const r=[BACKLIGHT_CUSTOM_COLOR,t,o,n];await this.hidCommand(7,r)}async setRGBMode(t){const o=[BACKLIGHT_EFFECT,t];await this.hidCommand(7,o)}async commitCustomMenu(t){await this.hidCommand(9,[t])}async saveLighting(){await this.hidCommand(9)}async resetEEPROM(){await this.hidCommand(10)}async jumpToBootloader(){await this.hidCommand(11)}async setKey(t,o,n,r){const s=await this.hidCommand(5,[t,o,n,...shiftFrom16Bit(r)]);return shiftTo16Bit([s[4],s[5]])}async getMacroCount(){const[,t]=await this.hidCommand(12);return t}async getMacroBufferSize(){const[,t,o]=await this.hidCommand(13);return shiftTo16Bit([t,o])}async getMacroBytes(){const t=await this.getMacroBufferSize(),o=28,n=[];for(let s=0;s<t;s+=28)n.push(this.hidCommand(14,[...shiftFrom16Bit(s),o]));return(await Promise.all(n)).flatMap(s=>s.slice(4))}async setMacroBytes(t){const o=await this.getMacroBufferSize(),n=t.length;if(n>o)throw new Error(`Macro size (${n}) exceeds buffer size (${o})`);const r=o-1,s=shiftFrom16Bit(r);await this.resetMacros();try{await this.hidCommand(15,[...shiftFrom16Bit(r),1,255]);const a=28;for(let i=0;i<t.length;i+=a){const c=t.slice(i,i+a);await this.hidCommand(15,[...shiftFrom16Bit(i),c.length,...c])}}finally{await this.hidCommand(15,[...s,1,0])}}async resetMacros(){await this.hidCommand(16)}get commandQueueWrapper(){return globalCommandQueue[this.kbAddr]?globalCommandQueue[this.kbAddr]:(globalCommandQueue[this.kbAddr]={isFlushing:!1,commandQueue:[]},globalCommandQueue[this.kbAddr])}async timeout(t){return new Promise((o,n)=>{this.commandQueueWrapper.commandQueue.push({res:o,rej:n,args:()=>new Promise(r=>setTimeout(()=>{r(),o(void 0)},t))}),this.commandQueueWrapper.isFlushing||this.flushQueue()})}async hidCommand(t,o=[]){return new Promise((n,r)=>{this.commandQueueWrapper.commandQueue.push({res:n,rej:r,args:[t,o]}),this.commandQueueWrapper.isFlushing||this.flushQueue()})}async flushQueue(){if(this.commandQueueWrapper.isFlushing!==!0){for(this.commandQueueWrapper.isFlushing=!0;this.commandQueueWrapper.commandQueue.length!==0;){const{res:t,rej:o,args:n}=this.commandQueueWrapper.commandQueue.shift();if(typeof n=="function")await n(),t();else try{const r=await this._hidCommand(...n);t(r)}catch(r){const s=extractDeviceInfo(this.getHID());store.dispatch(logAppError({message:getMessageFromError(r),deviceInfo:s})),o(r)}}this.commandQueueWrapper.isFlushing=!1}}getHID(){return cache[this.kbAddr].hid}async _hidCommand(t,o=[]){const n=[COMMAND_START,t,...o],r=new Array(33).fill(0);n.forEach((i,c)=>{r[c]=i}),await this.getHID().write(r);const s=Array.from(await this.getByteBuffer()),a=s.slice(0,n.length-1);if(logCommand(this.kbAddr,n,s),!eqArr(n.slice(1),a)){console.error(`Command for ${this.kbAddr}:`,n,"Bad Resp:",s);const i=extractDeviceInfo(this.getHID()),c=APICommandValueToName[t];throw store.dispatch(logKeyboardAPIError({commandName:c,commandBytes:n.slice(1),responseBytes:s,deviceInfo:i})),new Error("Receiving incorrect response for command")}return console.debug(`Command for ${this.kbAddr}`,n,"Correct Resp:",s),s}}function getVendorProductId(e,t){return e*65536+t}const idExists=({productId:e,vendorId:t},o)=>o[getVendorProductId(t,e)],getRecognisedDevices=async(e,t=!1)=>(await scanDevices(t)).filter(n=>idExists(n,e)&&canConnect(n));let deviceStore;const defaultStoreData={definitionIndex:{generatedAt:-1,hash:"",version:"2.0.0",theme:dist.getTheme(),accentColor:"#ad7070",supportedVendorProductIdMap:{}},definitions:{},settings:{showDesignTab:!1,disableFastRemap:!1,renderMode:"2D",themeMode:"dark",designDefinitionVersion:"v3",themeName:"OLIVIA_DARK",macroEditor:{smartOptimizeEnabled:!0,recordDelaysEnabled:!1,tapEnterAtEOMEnabled:!1},testKeyboardSoundsSettings:{isEnabled:!0,volume:100,waveform:"sine",mode:TestKeyboardSoundsMode.WickiHayden,transpose:0}}};function initDeviceStore(){deviceStore=new Store(defaultStoreData)}initDeviceStore();async function syncStore(){var t;const e=deviceStore.get("definitionIndex");try{const o=((t=document.getElementById("definition_hash"))==null?void 0:t.dataset.hash)||"";if(o===e.hash)return e;const r=await(await fetch("/definitions/supported_kbs.json",{cache:"reload"})).json(),s=r.vendorProductIds.v2.reduce((c,l)=>(c[l]=c[l]||{},c[l].v2=c[l].v3=!0,c),{}),a=r.vendorProductIds.v3.reduce((c,l)=>(c[l]=c[l]||{},c[l].v3=!0,c),s),i={...r,hash:o,supportedVendorProductIdMap:a};return deviceStore.set("definitionIndex",i),deviceStore.set("definitions",{}),i}catch(o){console.warn(o)}return e}const getMissingDefinition=async(e,t)=>{const o=getVendorProductId(e.vendorId,e.productId),n=`/definitions/${t}/${o}.json`,s=await(await fetch(n)).json();let a=deviceStore.get("definitions");const i={...a,[o]:{...a[o],[t]:s}};try{deviceStore.set("definitions",i)}catch{localStorage.clear(),initDeviceStore(),a=deviceStore.get("definitions"),deviceStore.set("definitions",{...a,[o]:{...a[o],[t]:s}})}return[s,t]},getSupportedIdsFromStore=()=>{var e;return(e=deviceStore.get("definitionIndex"))==null?void 0:e.supportedVendorProductIdMap},getDefinitionsFromStore=()=>deviceStore.get("definitions"),getThemeModeFromStore=()=>{var e;return(e=deviceStore.get("settings"))==null?void 0:e.themeMode},getThemeNameFromStore=()=>{var e;return(e=deviceStore.get("settings"))==null?void 0:e.themeName},getSettings=()=>deviceStore.get("settings"),setSettings=e=>{deviceStore.set("settings",R(e))},quantumRangesKeys=["_QK_MODS","_QK_MODS_MAX","_QK_MOD_TAP","_QK_MOD_TAP_MAX","_QK_LAYER_TAP","_QK_LAYER_TAP_MAX","_QK_LAYER_MOD","_QK_LAYER_MOD_MAX","_QK_TO","_QK_TO_MAX","_QK_MOMENTARY","_QK_MOMENTARY_MAX","_QK_DEF_LAYER","_QK_DEF_LAYER_MAX","_QK_TOGGLE_LAYER","_QK_TOGGLE_LAYER_MAX","_QK_ONE_SHOT_LAYER","_QK_ONE_SHOT_LAYER_MAX","_QK_ONE_SHOT_MOD","_QK_ONE_SHOT_MOD_MAX","_QK_LAYER_TAP_TOGGLE","_QK_LAYER_TAP_TOGGLE_MAX","_QK_KB","_QK_KB_MAX","_QK_MACRO","_QK_MACRO_MAX"],quantumRanges=e=>Object.keys(e).reduce((t,o)=>quantumRangesKeys.includes(o)?{...t,[o]:e[o]}:t,{}),modCodes={QK_LCTL:256,QK_LSFT:512,QK_LALT:1024,QK_LGUI:2048,QK_RMODS_MIN:4096,QK_RCTL:4352,QK_RSFT:4608,QK_RALT:5120,QK_RGUI:6144},modMasks={MOD_LCTL:1,MOD_LSFT:2,MOD_LALT:4,MOD_LGUI:8,MOD_RCTL:17,MOD_RSFT:18,MOD_RALT:20,MOD_RGUI:24,MOD_HYPR:15,MOD_MEH:7},topLevelMacroToValue={MT:"_QK_MOD_TAP",LT:"_QK_LAYER_TAP",LM:"_QK_LAYER_MOD",TO:"_QK_TO",MO:"_QK_MOMENTARY",DF:"_QK_DEF_LAYER",TG:"_QK_TOGGLE_LAYER",OSL:"_QK_ONE_SHOT_LAYER",OSM:"_QK_ONE_SHOT_MOD",TT:"_QK_LAYER_TAP_TOGGLE",CUSTOM:"_QK_KB",MACRO:"_QK_MACRO"},modifierKeyToValue={LCTL:modCodes.QK_LCTL,C:modCodes.QK_LCTL,LSFT:modCodes.QK_LSFT,S:modCodes.QK_LSFT,LALT:modCodes.QK_LALT,A:modCodes.QK_LALT,LGUI:modCodes.QK_LGUI,LCMD:modCodes.QK_LGUI,LWIN:modCodes.QK_LGUI,G:modCodes.QK_LGUI,RCTL:modCodes.QK_RCTL,RSFT:modCodes.QK_RSFT,ALGR:modCodes.QK_RALT,RALT:modCodes.QK_RALT,RCMD:modCodes.QK_RGUI,RWIN:modCodes.QK_RGUI,RGUI:modCodes.QK_RGUI,SCMD:modCodes.QK_LSFT|modCodes.QK_LGUI,SWIN:modCodes.QK_LSFT|modCodes.QK_LGUI,SGUI:modCodes.QK_LSFT|modCodes.QK_LGUI,LSG:modCodes.QK_LSFT|modCodes.QK_LGUI,LAG:modCodes.QK_LALT|modCodes.QK_LGUI,RSG:modCodes.QK_RSFT|modCodes.QK_RGUI,RAG:modCodes.QK_RALT|modCodes.QK_RGUI,LCA:modCodes.QK_LCTL|modCodes.QK_LALT,LSA:modCodes.QK_LSFT|modCodes.QK_LALT,SAGR:modCodes.QK_RSFT|modCodes.QK_RALT,RSA:modCodes.QK_RSFT|modCodes.QK_RALT,RCS:modCodes.QK_RCTL|modCodes.QK_RSFT,LCAG:modCodes.QK_LCTL|modCodes.QK_LALT|modCodes.QK_LGUI,MEH:modCodes.QK_LCTL|modCodes.QK_LALT|modCodes.QK_LSFT,HYPR:modCodes.QK_LCTL|modCodes.QK_LALT|modCodes.QK_LSFT|modCodes.QK_LGUI},modifierValueToKey=Object.entries(modifierKeyToValue).reduce((e,[t,o])=>({...e,[o]:t}),{}),leftModifierValueToKey=Object.entries(modifierKeyToValue).filter(([e,t])=>Object.values(modCodes).includes(t)&&t<modCodes.QK_RMODS_MIN).reduce((e,[t,o])=>({...e,[o]:t}),{}),rightModifierValueToKey=Object.entries(modifierKeyToValue).filter(([e,t])=>Object.values(modCodes).includes(t)&&t>=modCodes.QK_RMODS_MIN).reduce((e,[t,o])=>({...e,[o]:t}),{}),topLevelValueToMacro=e=>Object.entries(topLevelMacroToValue).reduce((t,[o,n])=>({...t,[e[n]]:o}),{}),advancedStringToKeycode=(e,t)=>{const n=e.toUpperCase().split(/\(|\)/).map(r=>r.trim());return Object.keys(topLevelMacroToValue).includes(n[0])?parseTopLevelMacro(n,t):Object.keys(modifierKeyToValue).includes(n[0])?parseModifierCode(n,t):0},advancedKeycodeToString=(e,t,o)=>{let n=Object.entries(quantumRanges(t)).map(([C,_])=>[_,C]).sort((C,_)=>C[0]-_[0]),r=null,s=-1;for(let C=0;C<n.length;C+=2)e>=n[C][0]&&e<=n[C+1][0]&&(r=n[C][1],s=+n[C][0]);if(["_QK_MODS"].includes(r))return topLevelModToString(e,o);let i=topLevelValueToMacro(t)[s]+"(",c=e&~s,l=0,d="",u=0;switch(r){case"_QK_KB":case"_QK_MACRO":i+=e-s+")";break;case"_QK_MOMENTARY":case"_QK_DEF_LAYER":case"_QK_TOGGLE_LAYER":case"_QK_ONE_SHOT_LAYER":case"_QK_LAYER_TAP_TOGGLE":case"_QK_TO":i+=c+")";break;case"_QK_LAYER_TAP":l=c>>8,d=o[c&255],i+=l+","+d+")";break;case"_QK_ONE_SHOT_MOD":i+=modValueToString(c)+")";break;case"_QK_LAYER_MOD":let C=t._QK_LAYER_MOD_MASK,_=Math.log2(C+1);l=c>>_,u=c&C,i+=l+","+modValueToString(u)+")";break;case"_QK_MOD_TAP":u=c>>8&31,d=o[c&255],i+=modValueToString(u)+","+d+")";break;default:i=null}return i},modValueToString=e=>{const t=["MOD_HYPR","MOD_MEH"];return Object.entries(modMasks).filter(n=>!t.includes(n[0])&&(n[1]&e)===n[1]).map(n=>n[0]).join(" | ")},topLevelModToString=(e,t)=>{const o=t[e&255],n=e&7936,r=modifierValueToKey[n];if(r!=null)return r+"("+o+")";const s=Object.entries(n&modCodes.QK_RMODS_MIN?rightModifierValueToKey:leftModifierValueToKey).filter(a=>{const i=Number.parseInt(a[0]);return(i&n)===i}).map(a=>a[1]);return s.join("(")+"("+o+")".repeat(s.length)},parseTopLevelMacro=(e,t)=>{const o=e[0],n=e[1]??"";let[r,s]=["",""],a=0,i=0;switch(o){case"MO":case"DF":case"TG":case"OSL":case"TT":case"TO":return a=Number.parseInt(n),a<0?0:t[topLevelMacroToValue[o]]|a&255;case"OSM":return i=parseMods(n),i===0?0:t[topLevelMacroToValue[o]]|i&255;case"LM":[r,s]=n.split(",").map(d=>d.trim());let c=t._QK_LAYER_MOD_MASK,l=Math.log2(c+1);return a=Number.parseInt(r),i=parseMods(s),a<0||i===0?0:t[topLevelMacroToValue[o]]|(a&15)<<l|i&c;case"LT":return[r,s]=n.split(",").map(d=>d.trim()),a=Number.parseInt(r),a<0||!t.hasOwnProperty(s)?0:t[topLevelMacroToValue[o]]|(a&15)<<8|t[s];case"MT":return[r,s]=n.split(",").map(d=>d.trim()),i=parseMods(r),i===0||!t.hasOwnProperty(s)?0:t[topLevelMacroToValue[o]]|(i&31)<<8|t[s]&255;case"CUSTOM":{const d=Number.parseInt(n),u=t._QK_KB_MAX-t._QK_KB;return d>=0&&d<=u?t[topLevelMacroToValue[o]]+d:0}case"MACRO":{const d=Number.parseInt(n),u=t._QK_MACRO_MAX-t._QK_MACRO;return d>=0&&d<=u?t[topLevelMacroToValue[o]]+d:0}default:return 0}},parseMods=(e="")=>{const t=e.split("|").map(o=>o.trim());return t.reduce((o,n)=>o&&modMasks.hasOwnProperty(n),!0)?t.reduce((o,n)=>o|modMasks[n],0):0},parseModifierCode=(e,t)=>{const o=e.filter(r=>r.length!==0),n=o.map((r,s)=>s===o.length-1?t.hasOwnProperty(r)?t[r]:null:modifierKeyToValue.hasOwnProperty(r)?modifierKeyToValue[r]:null);return n.find(r=>r===null)?0:n.reduce((r,s)=>r|s,0)},anyKeycodeToString=(e,t,o)=>{let n="";const r=advancedKeycodeToString(e,t,o);return o[e]&&!o[e].startsWith("_QK")?n=o[e]:r!==null&&(n=r),n};function isAlpha(e){return/[A-Za-z]/.test(e)&&e.length===1}function isNumpadNumber(e){return/['0-9]/.test(e)&&e.length===1}function isArrowKey(e){return/[🠗🠕🠖🠔←↑→↓]$/.test(e)}function isNumpadSymbol(e){const t="-+.÷×".split("");return e.length===1&&t.includes(e[0])}function isMultiLegend(e){const t='~!@#$%^&*()_+|{}:"<>?'.split("");return e.length!==1&&t.includes(e[0])}function getByteForCode(e,t){const o=t[e];if(o!==void 0)return o;if(isLayerCode(e))return getByteForLayerCode(e,t);if(advancedStringToKeycode(e,t)!==null)return advancedStringToKeycode(e,t);throw`Could not find byte for ${e}`}function isLayerCode(e){return/([A-Za-z]+)\((\d+)\)/.test(e)}function getByteForLayerCode(e,t){const o=e.match(/([A-Za-z]+)\((\d+)\)/);if(o){const[,n,r]=o,s=parseInt(r);switch(n){case"TO":return Math.min(t._QK_TO+s,t._QK_TO_MAX);case"MO":return Math.min(t._QK_MOMENTARY+s,t._QK_MOMENTARY_MAX);case"DF":return Math.min(t._QK_DEF_LAYER+s,t._QK_DEF_LAYER_MAX);case"TG":return Math.min(t._QK_TOGGLE_LAYER+s,t._QK_TOGGLE_LAYER_MAX);case"OSL":return Math.min(t._QK_ONE_SHOT_LAYER+s,t._QK_ONE_SHOT_LAYER_MAX);case"TT":return Math.min(t._QK_LAYER_TAP_TOGGLE+s,t._QK_LAYER_TAP_TOGGLE_MAX);case"CUSTOM":return Math.min(t._QK_KB+s,t._QK_KB_MAX);case"MACRO":return Math.min(t._QK_MACRO+s,t._QK_MACRO_MAX);default:throw new Error("Incorrect code")}}throw new Error("No match found")}function getCodeForLayerByte(e,t){if(t._QK_TO<=e&&t._QK_TO_MAX>=e)return`TO(${e-t._QK_TO})`;if(t._QK_MOMENTARY<=e&&t._QK_MOMENTARY_MAX>=e)return`MO(${e-t._QK_MOMENTARY})`;if(t._QK_DEF_LAYER<=e&&t._QK_DEF_LAYER_MAX>=e)return`DF(${e-t._QK_DEF_LAYER})`;if(t._QK_TOGGLE_LAYER<=e&&t._QK_TOGGLE_LAYER_MAX>=e)return`TG(${e-t._QK_TOGGLE_LAYER})`;if(t._QK_ONE_SHOT_LAYER<=e&&t._QK_ONE_SHOT_LAYER_MAX>=e)return`OSL(${e-t._QK_ONE_SHOT_LAYER})`;if(t._QK_LAYER_TAP_TOGGLE<=e&&t._QK_LAYER_TAP_TOGGLE_MAX>=e)return`TT(${e-t._QK_LAYER_TAP_TOGGLE})`;if(t._QK_KB<=e&&t._QK_KB_MAX>=e)return`CUSTOM(${e-t._QK_KB})`;if(t._QK_MACRO<=e&&t._QK_MACRO_MAX>=e)return`MACRO(${e-t._QK_MACRO})`}const keycodesList=getKeycodes().reduce((e,t)=>e.concat(t.keycodes),[]),getByteToKey=e=>Object.keys(e).reduce((t,o)=>{const n=e[o];if(n in t){const r=keycodesList.find(({code:s})=>s===o);return r?{...t,[n]:r.code}:t}return{...t,[n]:o}},{});function isLayerKey(e,t){return[[t._QK_TO,t._QK_TO_MAX],[t._QK_MOMENTARY,t._QK_MOMENTARY_MAX],[t._QK_DEF_LAYER,t._QK_DEF_LAYER_MAX],[t._QK_TOGGLE_LAYER,t._QK_TOGGLE_LAYER_MAX],[t._QK_ONE_SHOT_LAYER,t._QK_ONE_SHOT_LAYER_MAX],[t._QK_LAYER_TAP_TOGGLE,t._QK_LAYER_TAP_TOGGLE_MAX],[t._QK_KB,t._QK_KB_MAX],[t._QK_MACRO,t._QK_MACRO_MAX]].some(o=>e>=o[0]&&e<=o[1])}function getCodeForByte(e,t,o){const n=o[e];return n&&!n.startsWith("_QK")?n:isLayerKey(e,t)?getCodeForLayerByte(e,t):advancedKeycodeToString(e,t,o)!==null?advancedKeycodeToString(e,t,o):"0x"+Number(e).toString(16)}function keycodeInMaster(e,t){return e in t||isLayerCode(e)||advancedStringToKeycode(e,t)!==null}function shorten(e){return e.split(" ").map(t=>t.slice(0,1)+t.slice(1).replace(/[aeiou ]/gi,"")).join("")}function isCustomKeycodeByte(e,t){return e>=t._QK_KB&&e<=t._QK_KB_MAX}function getCustomKeycodeIndex(e,t){return e-t._QK_KB}function isMacroKeycodeByte(e,t){return e>=t._QK_MACRO&&e<=t._QK_MACRO_MAX}function getMacroKeycodeIndex(e,t){return e-t._QK_MACRO}function getLabelForByte(e,t=100,o,n){const r=getCodeForByte(e,o,n),s=keycodesList.find(({code:a})=>a===r);return s?getShortNameForKeycode(s,t):r}function getShortNameForKeycode(e,t=100){const{code:o,name:n,shortName:r}=e;if(t<=150&&r)return r;if(t===100&&n.length>5){const s=shorten(n);if(o){const a=o.replace("KC_","").replace("_"," ");return s.length>4&&a.length<s.length?a:s}return s}return n}function getOtherMenu(e){return{id:"other",label:"Other",keycodes:Object.keys(e).filter(o=>!o.startsWith("_QK")).filter(o=>!keycodesList.map(({code:n})=>n).includes(o)).map(o=>({name:o.replace("KC_","").replace(/_/g," "),code:o}))}}function buildLayerMenu(){const e=[{name:`Fn1
(Fn3)`,code:"FN_MO13",title:"Hold = Layer 1, Hold with Fn2 = Layer 3",shortName:"Fn1(3)"},{name:`Fn2
(Fn3)`,code:"FN_MO23",title:"Hold = Layer 2, Hold with Fn1 = Layer 3",shortName:"Fn2(3)"},{name:"Space Fn1",code:"LT(1,KC_SPC)",title:"Hold = Layer 1, Tap = Space",shortName:"Spc Fn1"},{name:"Space Fn2",code:"LT(2,KC_SPC)",title:"Hold = Layer 2, Tap = Space",shortName:"Spc Fn2"},{name:"Space Fn3",code:"LT(3,KC_SPC)",title:"Hold = Layer 3, Tap = Space",shortName:"Spc Fn3"}],t={id:"layers",label:"Layers",width:"label",keycodes:[{name:"MO",code:"MO(layer)",type:"layer",layer:0,title:"Momentary turn layer on"},{name:"TG",code:"TG(layer)",type:"layer",layer:0,title:"Toggle layer on/off"},{name:"TT",code:"TT(layer)",type:"layer",layer:0,title:"Normally acts like MO unless it's tapped multple times which toggles layer on"},{name:"OSL",code:"OSL(layer)",type:"layer",layer:0,title:"Switch to layer for one keypress"},{name:"TO",code:"TO(layer)",type:"layer",layer:0,title:"Turn on layer when pressed"},{name:"DF",code:"DF(layer)",type:"layer",layer:0,title:"Sets the default layer"}]};return{...t,keycodes:[...e,...t.keycodes.flatMap(o=>{let n=[];for(let r=0;r<10;r++){const s=(o.title||"").replace("layer",`layer ${r}`),a=o.code.replace("layer",`${r}`),i=o.name+`(${r})`;n=[...n,{...o,name:i,title:s,code:a}]}return n})]}}function generateMacros(e=16){let t=[];for(let o=0;o<e;o++){const n=`M${o}`,r=`MACRO(${o})`,s=`Macro ${o}`;t=[...t,{name:n,title:s,code:r}]}return t}function getKeycodes(e=16){return[{id:"basic",label:"Basic",keycodes:[{name:"",code:"KC_NO",title:"Nothing"},{name:"▽",code:"KC_TRNS",title:"Pass-through"},{name:"Esc",code:"KC_ESC",keys:"esc"},{name:"A",code:"KC_A",keys:"a"},{name:"B",code:"KC_B",keys:"b"},{name:"C",code:"KC_C",keys:"c"},{name:"D",code:"KC_D",keys:"d"},{name:"E",code:"KC_E",keys:"e"},{name:"F",code:"KC_F",keys:"f"},{name:"G",code:"KC_G",keys:"g"},{name:"H",code:"KC_H",keys:"h"},{name:"I",code:"KC_I",keys:"i"},{name:"J",code:"KC_J",keys:"j"},{name:"K",code:"KC_K",keys:"k"},{name:"L",code:"KC_L",keys:"l"},{name:"M",code:"KC_M",keys:"m"},{name:"N",code:"KC_N",keys:"n"},{name:"O",code:"KC_O",keys:"o"},{name:"P",code:"KC_P",keys:"p"},{name:"Q",code:"KC_Q",keys:"q"},{name:"R",code:"KC_R",keys:"r"},{name:"S",code:"KC_S",keys:"s"},{name:"T",code:"KC_T",keys:"t"},{name:"U",code:"KC_U",keys:"u"},{name:"V",code:"KC_V",keys:"v"},{name:"W",code:"KC_W",keys:"w"},{name:"X",code:"KC_X",keys:"x"},{name:"Y",code:"KC_Y",keys:"y"},{name:"Z",code:"KC_Z",keys:"z"},{name:`!
1`,code:"KC_1",keys:"1"},{name:`@
2`,code:"KC_2",keys:"2"},{name:`#
3`,code:"KC_3",keys:"3"},{name:`$
4`,code:"KC_4",keys:"4"},{name:`%
5`,code:"KC_5",keys:"5"},{name:`^
6`,code:"KC_6",keys:"6"},{name:`&
7`,code:"KC_7",keys:"7"},{name:`*
8`,code:"KC_8",keys:"8"},{name:`(
9`,code:"KC_9",keys:"9"},{name:`)
0`,code:"KC_0",keys:"0"},{name:`_
-`,code:"KC_MINS",keys:"-"},{name:`+
=`,code:"KC_EQL",keys:"="},{name:"~\n`",code:"KC_GRV",keys:"`"},{name:`{
[`,code:"KC_LBRC",keys:"["},{name:`}
]`,code:"KC_RBRC",keys:"]"},{name:`|
\\`,code:"KC_BSLS",keys:"\\",width:1500},{name:`:
;`,code:"KC_SCLN",keys:";"},{name:`"
'`,code:"KC_QUOT",keys:"'"},{name:`<
,`,code:"KC_COMM",keys:","},{name:`>
.`,code:"KC_DOT",keys:"."},{name:`?
/`,code:"KC_SLSH",keys:"/"},{name:"=",code:"KC_PEQL"},{name:",",code:"KC_PCMM"},{name:"F1",code:"KC_F1"},{name:"F2",code:"KC_F2"},{name:"F3",code:"KC_F3"},{name:"F4",code:"KC_F4"},{name:"F5",code:"KC_F5"},{name:"F6",code:"KC_F6"},{name:"F7",code:"KC_F7"},{name:"F8",code:"KC_F8"},{name:"F9",code:"KC_F9"},{name:"F10",code:"KC_F10"},{name:"F11",code:"KC_F11"},{name:"F12",code:"KC_F12"},{name:"Print Screen",code:"KC_PSCR",shortName:"Print"},{name:"Scroll Lock",code:"KC_SLCK",shortName:"Scroll"},{name:"Pause",code:"KC_PAUS"},{name:"Tab",code:"KC_TAB",keys:"tab",width:1500},{name:"Backspace",code:"KC_BSPC",keys:"backspace",width:2e3,shortName:"Bksp"},{name:"Insert",code:"KC_INS",keys:"insert",shortName:"Ins"},{name:"Del",code:"KC_DEL",keys:"delete"},{name:"Home",code:"KC_HOME",keys:"home"},{name:"End",code:"KC_END",keys:"end"},{name:"Page Up",code:"KC_PGUP",keys:"pageup",shortName:"PgUp"},{name:"Page Down",code:"KC_PGDN",keys:"pagedown",shortName:"PgDn"},{name:`Num
Lock`,code:"KC_NLCK",keys:"num",shortName:"N.Lck"},{name:"Caps Lock",code:"KC_CAPS",keys:"caps_lock",width:1750},{name:"Enter",code:"KC_ENT",keys:"enter",width:2250},{name:"1",code:"KC_P1",keys:"num_1",title:"Numpad 1"},{name:"2",code:"KC_P2",keys:"num_2",title:"Numpad 2"},{name:"3",code:"KC_P3",keys:"num_3",title:"Numpad 3"},{name:"4",code:"KC_P4",keys:"num_4",title:"Numpad 4"},{name:"5",code:"KC_P5",keys:"num_5",title:"Numpad 5"},{name:"6",code:"KC_P6",keys:"num_6",title:"Numpad 6"},{name:"7",code:"KC_P7",keys:"num_7",title:"Numpad 7"},{name:"8",code:"KC_P8",keys:"num_8",title:"Numpad 8"},{name:"9",code:"KC_P9",keys:"num_9",title:"Numpad 9"},{name:"0",code:"KC_P0",width:2e3,keys:"num_0",title:"Numpad 0"},{name:"÷",code:"KC_PSLS",keys:"num_divide",title:"Numpad ÷"},{name:"×",code:"KC_PAST",keys:"num_multiply",title:"Numpad ×"},{name:"-",code:"KC_PMNS",keys:"num_subtract",title:"Numpad -"},{name:"+",code:"KC_PPLS",keys:"num_add",title:"Numpad +"},{name:".",code:"KC_PDOT",keys:"num_decimal",title:"Numpad ."},{name:`Num
Enter`,code:"KC_PENT",shortName:"N.Ent",title:"Numpad Enter"},{name:"Left Shift",code:"KC_LSFT",keys:"shift",width:2250,shortName:"LShft"},{name:"Right Shift",code:"KC_RSFT",width:2750,shortName:"RShft"},{name:"Left Ctrl",code:"KC_LCTL",keys:"ctrl",width:1250},{name:"Right Ctrl",code:"KC_RCTL",width:1250,shortName:"RCtl"},{name:"Left Win",code:"KC_LGUI",keys:"cmd",width:1250,shortName:"LWin"},{name:"Right Win",code:"KC_RGUI",width:1250,shortName:"RWin"},{name:"Left Alt",code:"KC_LALT",keys:"alt",width:1250,shortName:"LAlt"},{name:"Right Alt",code:"KC_RALT",width:1250,shortName:"RAlt"},{name:"Space",code:"KC_SPC",keys:"space",width:6250},{name:"Menu",code:"KC_APP",width:1250,shortName:"RApp"},{name:"Left",code:"KC_LEFT",keys:"left",shortName:"←"},{name:"Down",code:"KC_DOWN",keys:"down",shortName:"↓"},{name:"Up",code:"KC_UP",keys:"up",shortName:"↑"},{name:"Right",code:"KC_RGHT",keys:"right",shortName:"→"}]},{id:"wt_lighting",label:"Lighting",width:"label",keycodes:[{name:"Bright -",code:"BR_DEC",title:"Brightness -",shortName:"BR -"},{name:"Bright +",code:"BR_INC",title:"Brightness +",shortName:"BR +"},{name:"Effect -",code:"EF_DEC",title:"Effect -",shortName:"EF -"},{name:"Effect +",code:"EF_INC",title:"Effect +",shortName:"EF +"},{name:"Effect Speed -",code:"ES_DEC",title:"Effect Speed -",shortName:"ES -"},{name:"Effect Speed +",code:"ES_INC",title:"Effect Speed +",shortName:"ES +"},{name:"Color1 Hue -",code:"H1_DEC",title:"Color1 Hue -",shortName:"H1 -"},{name:"Color1 Hue +",code:"H1_INC",title:"Color1 Hue +",shortName:"H1 +"},{name:"Color2 Hue -",code:"H2_DEC",title:"Color2 Hue -",shortName:"H2 -"},{name:"Color2 Hue +",code:"H2_INC",title:"Color2 Hue +",shortName:"H2 +"},{name:"Color1 Sat -",code:"S1_DEC",title:"Color1 Sat -",shortName:"S1 -"},{name:"Color1 Sat +",code:"S1_INC",title:"Color1 Sat +",shortName:"S1 +"},{name:"Color2 Sat -",code:"S2_DEC",title:"Color2 Sat -",shortName:"S2 -"},{name:"Color2 Sat +",code:"S2_INC",title:"Color2 Sat +",shortName:"S2 +"}]},{id:"media",label:"Media",width:"label",keycodes:[{name:"Vol -",code:"KC_VOLD",title:"Volume Down"},{name:"Vol +",code:"KC_VOLU",title:"Volume Up"},{name:"Mute",code:"KC_MUTE",title:"Mute Audio"},{name:"Play",code:"KC_MPLY",title:"Play/Pause"},{name:"Media Stop",code:"KC_MSTP",title:"Media Stop"},{name:"Previous",code:"KC_MPRV",title:"Media Previous"},{name:"Next",code:"KC_MNXT",title:"Media Next"},{name:"Rewind",code:"KC_MRWD",title:"Rewind"},{name:"Fast Forward",code:"KC_MFFD",title:"Fast Forward"},{name:"Select",code:"KC_MSEL",title:"Media Select"},{name:"Eject",code:"KC_EJCT",title:"Media Eject"}]},{id:"macro",label:"Macro",width:"label",keycodes:generateMacros(e)},buildLayerMenu(),{id:"special",label:"Special",width:"label",keycodes:[{name:"~",code:"S(KC_GRV)",keys:"`",title:"Shift + `"},{name:"!",code:"S(KC_1)",keys:"!",title:"Shift + 1"},{name:"@",code:"S(KC_2)",keys:"@",title:"Shift + 2"},{name:"#",code:"S(KC_3)",keys:"#",title:"Shift + 3"},{name:"$",code:"S(KC_4)",keys:"$",title:"Shift + 4"},{name:"%",code:"S(KC_5)",keys:"%",title:"Shift + 5"},{name:"^",code:"S(KC_6)",keys:"^",title:"Shift + 6"},{name:"&",code:"S(KC_7)",keys:"&",title:"Shift + 7"},{name:"*",code:"S(KC_8)",keys:"*",title:"Shift + 8"},{name:"(",code:"S(KC_9)",keys:"(",title:"Shift + 9"},{name:")",code:"S(KC_0)",keys:")",title:"Shift + 0"},{name:"_",code:"S(KC_MINS)",keys:"_",title:"Shift + -"},{name:"+",code:"S(KC_EQL)",keys:"+",title:"Shift + ="},{name:"{",code:"S(KC_LBRC)",keys:"{",title:"Shift + ["},{name:"}",code:"S(KC_RBRC)",keys:"}",title:"Shift + ]"},{name:"|",code:"S(KC_BSLS)",keys:"|",title:"Shift + \\"},{name:":",code:"S(KC_SCLN)",keys:":",title:"Shift + /"},{name:'"',code:"S(KC_QUOT)",keys:'"',title:"Shift + '"},{name:"<",code:"S(KC_COMM)",keys:"<",title:"Shift + ,"},{name:">",code:"S(KC_DOT)",keys:">",title:"Shift + ."},{name:"?",code:"S(KC_SLSH)",keys:"?",title:"Shift + /"},{name:"NUHS",code:"KC_NUHS",title:"Non-US # and ~"},{name:"NUBS",code:"KC_NUBS",title:"Non-US \\ and |"},{name:"Ro",code:"KC_RO",title:"JIS \\ and |"},{name:"¥",code:"KC_JYEN",title:"JPN Yen"},{name:"無変換",code:"KC_MHEN",title:"JIS Muhenkan"},{name:"漢字",code:"KC_HANJ",title:"Hanja"},{name:"한영",code:"KC_HAEN",title:"HanYeong"},{name:"変換",code:"KC_HENK",title:"JIS Henkan"},{name:"かな",code:"KC_KANA",title:"JIS Katakana/Hiragana"},{name:"Esc `",code:"KC_GESC",title:"Esc normally, but ` when Shift or Win is pressed"},{name:"LS (",code:"KC_LSPO",title:"Left Shift when held, ( when tapped"},{name:"RS )",code:"KC_RSPC",title:"Right Shift when held, ) when tapped"},{name:"LC (",code:"KC_LCPO",title:"Left Control when held, ( when tapped"},{name:"RC )",code:"KC_RCPC",title:"Right Control when held, ) when tapped"},{name:"LA (",code:"KC_LAPO",title:"Left Alt when held, ( when tapped"},{name:"RA )",code:"KC_RAPC",title:"Right Alt when held, ) when tapped"},{name:"SftEnt",code:"KC_SFTENT",title:"Right Shift when held, Enter when tapped"},{name:"Reset",code:"RESET",title:"Reset the keyboard"},{name:"Debug",code:"DEBUG",title:"Toggle debug mode"},{name:"Toggle NKRO",code:"MAGIC_TOGGLE_NKRO",shortName:"NKRO",title:"Toggle NKRO"},{name:"Locking Num Lock",code:"KC_LNUM"},{name:"Locking Caps Lock",code:"KC_LCAP"},{name:"Locking Scroll Lock",code:"KC_LSCR"},{name:"Power",code:"KC_PWR"},{name:"Power OSX",code:"KC_POWER"},{name:"Sleep",code:"KC_SLEP"},{name:"Wake",code:"KC_WAKE"},{name:"Calc",code:"KC_CALC"},{name:"Mail",code:"KC_MAIL"},{name:"Help",code:"KC_HELP"},{name:"Stop",code:"KC_STOP"},{name:"Alt Erase",code:"KC_ERAS"},{name:"Again",code:"KC_AGAIN"},{name:"Menu",code:"KC_MENU"},{name:"Undo",code:"KC_UNDO"},{name:"Select",code:"KC_SELECT"},{name:"Exec",code:"KC_EXECUTE"},{name:"Cut",code:"KC_CUT"},{name:"Copy",code:"KC_COPY"},{name:"Paste",code:"KC_PASTE"},{name:"Find",code:"KC_FIND"},{name:"My Comp",code:"KC_MYCM"},{name:"Home",code:"KC_WWW_HOME"},{name:"Back",code:"KC_WWW_BACK"},{name:"Forward",code:"KC_WWW_FORWARD"},{name:"Stop",code:"KC_WWW_STOP"},{name:"Refresh",code:"KC_WWW_REFRESH"},{name:"Favorites",code:"KC_WWW_FAVORITES"},{name:"Search",code:"KC_WWW_SEARCH"},{name:"Screen +",code:"KC_BRIU",shortName:"Scr +",title:"Screen Brightness Up"},{name:"Screen -",code:"KC_BRID",shortName:"Scr -",title:"Screen Brightness Down"},{name:"F13",code:"KC_F13"},{name:"F14",code:"KC_F14"},{name:"F15",code:"KC_F15"},{name:"F16",code:"KC_F16"},{name:"F17",code:"KC_F17"},{name:"F18",code:"KC_F18"},{name:"F19",code:"KC_F19"},{name:"F20",code:"KC_F20"},{name:"F21",code:"KC_F21"},{name:"F22",code:"KC_F22"},{name:"F23",code:"KC_F23"},{name:"F24",code:"KC_F24"},{name:"Mouse ↑",code:"KC_MS_UP"},{name:"Mouse ↓",code:"KC_MS_DOWN"},{name:"Mouse ←",code:"KC_MS_LEFT"},{name:"Mouse →",code:"KC_MS_RIGHT"},{name:"Mouse Btn1",code:"KC_MS_BTN1"},{name:"Mouse Btn2",code:"KC_MS_BTN2"},{name:"Mouse Btn3",code:"KC_MS_BTN3"},{name:"Mouse Btn4",code:"KC_MS_BTN4"},{name:"Mouse Btn5",code:"KC_MS_BTN5"},{name:"Mouse Btn6",code:"KC_MS_BTN6"},{name:"Mouse Btn7",code:"KC_MS_BTN7"},{name:"Mouse Btn8",code:"KC_MS_BTN8"},{name:"Mouse Wh ↑",code:"KC_MS_WH_UP"},{name:"Mouse Wh ↓",code:"KC_MS_WH_DOWN"},{name:"Mouse Wh ←",code:"KC_MS_WH_LEFT"},{name:"Mouse Wh →",code:"KC_MS_WH_RIGHT"},{name:"Mouse Acc0",code:"KC_MS_ACCEL0"},{name:"Mouse Acc1",code:"KC_MS_ACCEL1"},{name:"Mouse Acc2",code:"KC_MS_ACCEL2"},{name:"Audio On",code:"AU_ON"},{name:"Audio Off",code:"AU_OFF"},{name:"Audio Toggle",code:"AU_TOG"},{name:"Clicky Toggle",code:"CLICKY_TOGGLE"},{name:"Clicky Enable",code:"CLICKY_ENABLE"},{name:"Clicky Disable",code:"CLICKY_DISABLE"},{name:"Clicky Up",code:"CLICKY_UP"},{name:"Clicky Down",code:"CLICKY_DOWN"},{name:"Clicky Reset",code:"CLICKY_RESET"},{name:"Music On",code:"MU_ON"},{name:"Music Off",code:"MU_OFF"},{name:"Music Toggle",code:"MU_TOG"},{name:"Music Mode",code:"MU_MOD"}]},{id:"qmk_lighting",label:"Lighting",width:"label",keycodes:[{name:"BL Toggle",code:"BL_TOGG"},{name:"BL On",code:"BL_ON"},{name:"BL Off",code:"BL_OFF",shortName:"BL Off"},{name:"BL -",code:"BL_DEC"},{name:"BL +",code:"BL_INC"},{name:"BL Cycle",code:"BL_STEP"},{name:"BR Toggle",code:"BL_BRTG"},{name:"RGB Toggle",code:"RGB_TOG"},{name:"RGB Mode -",code:"RGB_RMOD"},{name:"RGB Mode +",code:"RGB_MOD"},{name:"Hue -",code:"RGB_HUD"},{name:"Hue +",code:"RGB_HUI"},{name:"Sat -",code:"RGB_SAD"},{name:"Sat +",code:"RGB_SAI"},{name:"Bright -",code:"RGB_VAD"},{name:"Bright +",code:"RGB_VAI"},{name:"Effect Speed-",code:"RGB_SPD"},{name:"Effect Speed+",code:"RGB_SPI"},{name:"RGB Mode P",code:"RGB_M_P",title:"Plain"},{name:"RGB Mode B",code:"RGB_M_B",title:"Breathe"},{name:"RGB Mode R",code:"RGB_M_R",title:"Rainbow"},{name:"RGB Mode SW",code:"RGB_M_SW",title:"Swirl"},{name:"RGB Mode SN",code:"RGB_M_SN",title:"Snake"},{name:"RGB Mode K",code:"RGB_M_K",title:"Knight"},{name:"RGB Mode X",code:"RGB_M_X",title:"Xmas"},{name:"RGB Mode G",code:"RGB_M_G",title:"Gradient"}]},{id:"custom",label:"Custom",width:"label",keycodes:[{name:"CUSTOM(0)",code:"CUSTOM(0)",title:"Custom Keycode 0"},{name:"CUSTOM(1)",code:"CUSTOM(1)",title:"Custom Keycode 1"},{name:"CUSTOM(2)",code:"CUSTOM(2)",title:"Custom Keycode 2"},{name:"CUSTOM(3)",code:"CUSTOM(3)",title:"Custom Keycode 3"},{name:"CUSTOM(4)",code:"CUSTOM(4)",title:"Custom Keycode 4"},{name:"CUSTOM(5)",code:"CUSTOM(5)",title:"Custom Keycode 5"},{name:"CUSTOM(6)",code:"CUSTOM(6)",title:"Custom Keycode 6"},{name:"CUSTOM(7)",code:"CUSTOM(7)",title:"Custom Keycode 7"},{name:"CUSTOM(8)",code:"CUSTOM(8)",title:"Custom Keycode 8"},{name:"CUSTOM(9)",code:"CUSTOM(9)",title:"Custom Keycode 9"},{name:"CUSTOM(10)",code:"CUSTOM(10)",title:"Custom Keycode 10"},{name:"CUSTOM(11)",code:"CUSTOM(11)",title:"Custom Keycode 11"},{name:"CUSTOM(12)",code:"CUSTOM(12)",title:"Custom Keycode 12"},{name:"CUSTOM(13)",code:"CUSTOM(13)",title:"Custom Keycode 13"},{name:"CUSTOM(14)",code:"CUSTOM(14)",title:"Custom Keycode 14"},{name:"CUSTOM(15)",code:"CUSTOM(15)",title:"Custom Keycode 15"}]}]}const categoriesForKeycodeModule=e=>({default:["basic","media","macro","layers","special"],[dist.BuiltInKeycodeModule.WTLighting]:["wt_lighting"],[dist.BuiltInKeycodeModule.QMKLighting]:["qmk_lighting"]})[e],getKeycodesForKeyboard=e=>{let t=[];if("lighting"in e){const{keycodes:o}=dist.getLightingDefinition(e.lighting);t=categoriesForKeycodeModule("default").concat(o===dist.KeycodeType.None?[]:o===dist.KeycodeType.QMK?categoriesForKeycodeModule(dist.BuiltInKeycodeModule.QMKLighting):categoriesForKeycodeModule(dist.BuiltInKeycodeModule.WTLighting))}else{const{keycodes:o}=e;t=o.flatMap(categoriesForKeycodeModule)}return getKeycodes().flatMap(o=>t.includes(o.id)?o.keycodes:[]).sort((o,n)=>o.code<=n.code?-1:1)},CSSVarObject={keyWidth:52,keyXSpacing:2,keyHeight:54,keyYSpacing:2,keyXPos:52+2,keyYPos:54+2,faceXPadding:[6,6],faceYPadding:[2,10],insideBorder:10},KeycapMetric={keyWidth:18.1,keyXSpacing:1.05,keyHeight:18.1,keyYSpacing:1.05,keyXPos:19.15,keyYPos:19.15},getComboKeyProps=e=>{if(e.w2===void 0||e.h2===void 0)return{clipPath:null,normalizedRects:null};const{x:t,y:o,x2:n=0,y2:r=0,w:s,w2:a,h:i,h2:c}=e,l=Math.max(e.w,e.w2),d=Math.max(e.h,e.h2),u=Math.min(t,t+n),C=Math.min(o,o+r),[_,h,p,K,g,y,m,S]=s===l?[t+n-u,t-u,o+r-C,o-C,a,s,c,i]:[t-u,t+n-u,o-C,o+r-C,s,a,i,c],b=M=>`polygon(${M.map(T=>`${100*T[0]}% ${100*T[1]}%`).join(",")})`,E=[[h/l,K/d],[_/l,K/d],[_/l,p/d],[(_+g)/l,p/d],[(_+g)/l,K/d],[(h+y)/l,K/d],[(h+y)/l,(K+S)/d],[(_+g)/l,(K+S)/d],[(_+g)/l,(p+m)/d],[_/l,(p+m)/d],[_/l,(K+S)/d],[h/l,(K+S)/d]];return{clipPath:b(E),normalizedRects:[[_,p,g,m],[h,K,y,S]]}};function calculatePointPosition({x:e=0,x2:t=0,y:o=0,r:n=0,rx:r=0,ry:s=0,w:a=0,w2:i=0,h:c=0}){const l=n*(2*Math.PI)/360,d=Math.cos(l),u=Math.sin(l),C=CSSVarObject.keyXPos*r,_=CSSVarObject.keyYPos*s,h=CSSVarObject.keyXPos*(e+t)+Math.max(i,a)*CSSVarObject.keyWidth/2+(Math.max(i,a)-1)*CSSVarObject.keyXSpacing/2,p=CSSVarObject.keyYPos*o+c*CSSVarObject.keyHeight/2+(c-1)*CSSVarObject.keyYSpacing/2,K=h*d-p*u-C*d+_*u+C,g=h*u+p*d-C*u-_*d+_;return[K,g]}const sortByX=(e,t)=>{const o=calculatePointPosition(e),n=calculatePointPosition(t);return o[0]-n[0]},sortByYX=(e,t)=>{const o=calculatePointPosition(e),n=calculatePointPosition(t);return o[1]-n[1]===0?o[0]-n[0]:o[1]-n[1]},withinChain=(e,t)=>{const o=calculatePointPosition(e),n=calculatePointPosition(t);return Math.abs(o[1]-n[1])<CSSVarObject.keyYPos*.9},getTraversalOrder=e=>{const[t,...o]=[...e].sort(sortByYX);if(t===void 0)return o;{const[n,r]=partition([...e],s=>withinChain(t,s));return[...n.sort(sortByX),...getTraversalOrder(r)]}},widthProfiles={1:[1,2,3,4],1.25:[4],1.5:[2,4],1.75:[3,4],2:[1,4],2.25:[3,4],2.75:[4],3:[4],6.25:[4],7:[4]},getRowForKey=(e,t)=>e.h!==1?t:widthProfiles[e.w]?widthProfiles[e.w].includes(t)?t:widthProfiles[e.w][0]:4,getRowProfiles=e=>{switch(!e.some(o=>o.some(n=>n.w!==1||n.h!==1))||e.length){case 8:return[1,1,1,1,2,3,4,4];case 7:return[1,1,1,2,3,4,4];case 6:return[1,1,2,3,4,4];case 5:return[1,2,3,4,4];case 4:return[2,3,4,4];case 3:return[2,3,4];default:return Array(e.length).fill(1)}},getKeyId=e=>`${e.w}-${e.h}-${e.col}-${e.row}-${e.w2}-${e.h2}`,getKeyboardRowPartitions=e=>{const{partitionedKeys:t}=getTraversalOrder(e).reduce(({prevX:n,partitionedKeys:r},s)=>{const[a]=calculatePointPosition(s);return n>=a&&r.push([]),r[r.length-1].push(s),{partitionedKeys:r,prevX:a}},{partitionedKeys:[],prevX:1/0}),o=getRowProfiles(t);return{rowMap:t.reduce((n,r,s)=>r.reduce((a,i)=>({...a,[getKeyId(i)]:getRowForKey(i,o[s])}),n),{}),partitionedKeys:t}},getNextKey=(e,t)=>{const o=t.filter(a=>!a.d),n=t[e],r=getTraversalOrder([...o]),s=r.indexOf(n);return s===r.length-1?null:t.indexOf(r[(s+1)%r.length])},makeSRGBTheme=e=>Object.entries(e).reduce((t,[o,n])=>{const r=`#${new Color(n.c).convertSRGBToLinear().getHexString()}`,s=`#${new Color(n.t).convertSRGBToLinear().getHexString()}`;return{...t,[o]:{c:r,t:s}}},{}),calculateKeyboardFrameDimensions=e=>{const t=e.map(dist.getBoundingBox),o=Math.min(...t.map(a=>a.xStart)),n=Math.min(...t.map(a=>a.yStart)),r=Math.max(...t.map(a=>a.xEnd))-o,s=Math.max(...t.map(a=>a.yEnd))-n;return{width:r,height:s}},getMeshName=(e,t,o)=>{if(e.ei!==void 0)return"E-100";if(e.h===2&&e.w===1)return`K-R${t}V-200`;if(e.w===1.25&&e.w2===1.5)return"K-R2-ISO";if(e.w===1.5&&e.w2===2.25)return"K-R2-BAE";if(e.h>1)return o?"K-R4C-100":"K-R4-100";if(!o)switch(e.w){case 1.25:case 1.5:case 1.75:case 1:case 2:case 2.25:case 2.75:return`K-R${t}-${e.w*100}`;case 3:case 6:case 6.25:case 6.5:case 7:return`K-R4C-${e.w*100}`;default:return"K-R4C-100"}switch(e.w){case 1:case 1.25:case 1.5:case 1.75:return`K-R${t}-${e.w*100}`;case 2:case 2.25:case 2.75:case 3:case 6:case 6.25:case 6.5:case 7:return`K-R4C-${e.w*100}`;default:return"K-R4C-100"}},getScale=(e,t)=>{if(e.ei!==void 0)return t;if(e.h===2&&e.w===1)return[1,1,1];if(e.w===1.25&&e.w2===1.5)return[1,1,1];if(e.w===1.5&&e.w2===2.25)return[1,1,1];if(e.h>1)return t;if(e.h==1)switch(e.w){case 1.25:case 1.5:case 1.75:case 2:case 2.25:case 2.75:case 3:case 6:case 6.25:case 6.5:case 7:return[1,1,1];case 1:return[1,1,1];default:return t}return t},getLabelOffsets=(e,t)=>{let o=0,n=0;return e.length==1&&'^*"'.split("").includes(e[0])&&(o=.2),t.length==1&&(",.".split("").includes(t[0])?n=.4:"/\\;'[]".split("").includes(t[0])?n=.3:"-".split("").includes(t[0])&&(n=.1)),[o,n]},getLabel=(e,t,o,n,r,s)=>{let a="",i=1,c=[0,0],l="";if(isCustomKeycodeByte(e,r)&&(n!=null&&n.customKeycodes)&&n.customKeycodes[getCustomKeycodeIndex(e,r)]!==void 0){const u=getCustomKeycodeIndex(e,r);a=getShortNameForKeycode(n.customKeycodes[u]),l=getShortNameForKeycode(n.customKeycodes[u],700)}else e&&(a=getLabelForByte(e,t*100,r,s)??"",l=getLabelForByte(e,700,r,s)??"");let d;if(isMacroKeycodeByte(e,r)){const u=getMacroKeycodeIndex(e,r);d=o[u],l=d||""}if(isAlpha(a)||isNumpadNumber(a))return a&&{label:a.toUpperCase(),macroExpression:d,key:(a||"")+(d||""),size:i,offset:c};if(isMultiLegend(a)){const u=a[0],C=a[a.length-1];return C&&{topLabel:u,bottomLabel:C,macroExpression:d,key:(a||"")+(d||""),size:i,offset:getLabelOffsets(u,C)}}else return isNumpadSymbol(a)&&(i=2),isArrowKey(a)&&(i=1.5),{label:a,centerLabel:a,tooltipLabel:l,macroExpression:d,key:(a||"")+(d||""),size:i,offset:c}},updateCSSVariables=e=>{const t=THEMES[e]||THEMES.OLIVIA_DARK;document.documentElement.style.setProperty("--color_accent",t.accent.c),document.documentElement.style.setProperty("--color_inside-accent",t.accent.t)};function getRGBPrime(e,t,o){if(e>=0&&e<60)return[t,o,0];if(e>=60&&e<120)return[o,t,0];if(e>=120&&e<180)return[0,t,o];if(e>=180&&e<240)return[0,o,t];if(e>=240&&e<300)return[o,0,t];if(e>=300&&e<360)return[t,0,o];if(e===360)return[t,o,0];throw new Error("Invalid hue")}const getColorByte=e=>{const t=e.replace("#",""),o=parseInt(t[0],16)*16+parseInt(t[1],16),n=parseInt(t[2],16)*16+parseInt(t[3],16),r=parseInt(t[4],16)*16+parseInt(t[5],16);return[o,n,r]},getDarkenedColor=(e,t=.8)=>{const[o,n,r]=getColorByte(e),s=Math.round(o*t).toString(16),a=Math.round(n*t).toString(16),i=Math.round(r*t).toString(16);return`#${s.padStart(2,"0")}${a.padStart(2,"0")}${i.padStart(2,"0")}`},getHSV=e=>{const[t,o,n]=getColorByte(e).map(d=>d/255),[r,s]=[Math.max(t,o,n),Math.min(t,o,n)],a=r-s;let i=60,c=0,l=r;return a===0?i=i*0:r===t?i=i*((o-n)/a%6):r===o?i=i*((n-t)/a+2):r===n&&(i=i*((t-o)/a+4)),r!==0&&(c=a/r),[(i+360)%360,c,l]},getHSVFrom256=e=>[Math.round(360*e[0]/255),Math.round(e[1]/255),1];function getRGB({hue:e,sat:t}){t=t/255,e=Math.round(360*e)/255;const o=t,n=o*(1-Math.abs(e/60%2-1)),r=1-o,[s,a,i]=getRGBPrime(e,o,n).map(c=>Math.round(255*(r+c)));return`rgba(${s},${a},${i},1)`}function toDegrees(e){return e*(180/Math.PI)}function calcRadialHue(e,t){if(e<200&&t<200){const o=200-e,n=200-t;return 2*Math.PI-Math.atan(o/n)}else if(e>200&&t<200){const o=e-200,n=200-t;return Math.atan(o/n)}else if(e<200&&t>200){const o=200-e,n=t-200;return Math.PI+Math.atan(o/n)}else if(e>200&&t>200){const o=e-200,n=t-200;return .5*Math.PI+Math.atan(n/o)}else{if(e===200)return t>200?Math.PI:0;if(t===200)return e>=200?.5*Math.PI:1.5*Math.PI}}function calcRadialMagnitude(e,t){if(e<200&&t<200){const o=200-e,n=200-t;return Math.sqrt(o*o+n*n)/200}else if(e>200&&t<200){const o=e-200,n=200-t;return Math.sqrt(o*o+n*n)/200}else if(e<200&&t>200){const o=200-e,n=t-200;return Math.sqrt(o*o+n*n)/200}else if(e>200&&t>200){const o=e-200,n=t-200;return Math.sqrt(o*o+n*n)/200}else{if(e===200)return t>200?(t-200)/200:(200-t)/200;if(t===200)return e>200?(e-200)/200:(200-e)/200}}function hsToRgb({hue:e,sat:t}){t=t/255,e=Math.round(360*e)/255;const o=t,n=o*(1-Math.abs(e/60%2-1)),r=1-o,[s,a,i]=getRGBPrime(e,o,n).map(c=>Math.round(255*(r+c)));return[s,a,i]}function getHex({hue:e,sat:t}){let[o,n,r]=hsToRgb({hue:e,sat:t}).map(s=>s.toString(16));return o.length==1&&(o="0"+o),n.length==1&&(n="0"+n),r.length==1&&(r="0"+r),"#"+o+n+r}function isWebGLAvailable(){try{const e=document.createElement("canvas");return!!(window.WebGLRenderingContext&&(e.getContext("webgl")||e.getContext("experimental-webgl")))}catch{return!1}}const webGLIsAvailable=isWebGLAvailable(),initialState$6={...getSettings(),isTestMatrixEnabled:!1,restartRequired:!1,allowGlobalHotKeys:!1},toggleBool=(e,t)=>{e[t]=!e[t],setSettings(e)},settingsSlice=createSlice({name:"settings",initialState:initialState$6,reducers:{toggleFastRemap:e=>{toggleBool(e,"disableFastRemap")},toggleCreatorMode:e=>{toggleBool(e,"showDesignTab")},toggleThemeMode:e=>{const t=e.themeMode==="light"?"dark":"light";document.documentElement.dataset.themeMode=t,e.themeMode=t,setSettings(e)},updateRenderMode:(e,t)=>{e.renderMode=t.payload,setSettings(e)},updateDesignDefinitionVersion:(e,t)=>{e.designDefinitionVersion=t.payload,setSettings(e)},updateThemeName:(e,t)=>{e.themeName=t.payload,updateCSSVariables(e.themeName),setSettings(e)},setTestMatrixEnabled:(e,t)=>{e.isTestMatrixEnabled=t.payload},setMacroEditorSettings:(e,t)=>{const o={...e.macroEditor,...t.payload};e.macroEditor=o,setSettings(e)},setTestKeyboardSoundsSettings:(e,t)=>{const o={...e.testKeyboardSoundsSettings,...t.payload};e.testKeyboardSoundsSettings=o,setSettings(e)},disableGlobalHotKeys:e=>{e.allowGlobalHotKeys=!1},enableGlobalHotKeys:e=>{e.allowGlobalHotKeys=!0}}}),{toggleFastRemap,toggleCreatorMode,setTestMatrixEnabled,setTestKeyboardSoundsSettings,setMacroEditorSettings,toggleThemeMode,disableGlobalHotKeys,enableGlobalHotKeys,updateRenderMode,updateThemeName,updateDesignDefinitionVersion}=settingsSlice.actions,settingsReducer=settingsSlice.reducer,getDesignDefinitionVersion=e=>e.settings.designDefinitionVersion,getDisableFastRemap=e=>e.settings.disableFastRemap,getShowDesignTab=e=>e.settings.showDesignTab,getIsTestMatrixEnabled=e=>e.settings.isTestMatrixEnabled,getMacroEditorSettings=e=>e.settings.macroEditor,getTestKeyboardSoundsSettings=e=>e.settings.testKeyboardSoundsSettings,getRenderMode=e=>webGLIsAvailable?e.settings.renderMode:"2D",getThemeMode=e=>e.settings.themeMode,getThemeName=e=>e.settings.themeName,getSelectedTheme=createSelector(getThemeName,e=>THEMES[e]),getSelectedSRGBTheme=createSelector(getSelectedTheme,e=>makeSRGBTheme(e)),basicKeyToByte={_QK_MODS:256,_QK_MODS_MAX:8191,_QK_MOD_TAP:24576,_QK_MOD_TAP_MAX:32767,_QK_LAYER_TAP:16384,_QK_LAYER_TAP_MAX:20479,_QK_LAYER_MOD:22784,_QK_LAYER_MOD_MAX:23039,_QK_TO:20496,_QK_TO_MAX:20511,_QK_MOMENTARY:20736,_QK_MOMENTARY_MAX:20767,_QK_DEF_LAYER:20992,_QK_DEF_LAYER_MAX:21023,_QK_TOGGLE_LAYER:21248,_QK_TOGGLE_LAYER_MAX:21279,_QK_ONE_SHOT_LAYER:21504,_QK_ONE_SHOT_LAYER_MAX:21535,_QK_ONE_SHOT_MOD:21760,_QK_ONE_SHOT_MOD_MAX:22015,_QK_LAYER_TAP_TOGGLE:22528,_QK_LAYER_TAP_TOGGLE_MAX:22559,_QK_LAYER_MOD_MASK:15,_QK_MACRO:24338,_QK_MACRO_MAX:24353,_QK_KB:24448,_QK_KB_MAX:24463,KC_NO:0,KC_TRNS:1,KC_A:4,KC_B:5,KC_C:6,KC_D:7,KC_E:8,KC_F:9,KC_G:10,KC_H:11,KC_I:12,KC_J:13,KC_K:14,KC_L:15,KC_M:16,KC_N:17,KC_O:18,KC_P:19,KC_Q:20,KC_R:21,KC_S:22,KC_T:23,KC_U:24,KC_V:25,KC_W:26,KC_X:27,KC_Y:28,KC_Z:29,KC_1:30,KC_2:31,KC_3:32,KC_4:33,KC_5:34,KC_6:35,KC_7:36,KC_8:37,KC_9:38,KC_0:39,KC_ENT:40,KC_ESC:41,KC_BSPC:42,KC_TAB:43,KC_SPC:44,KC_MINS:45,KC_EQL:46,KC_LBRC:47,KC_RBRC:48,KC_BSLS:49,KC_NUHS:50,KC_SCLN:51,KC_QUOT:52,KC_GRV:53,KC_COMM:54,KC_DOT:55,KC_SLSH:56,KC_CAPS:57,KC_F1:58,KC_F2:59,KC_F3:60,KC_F4:61,KC_F5:62,KC_F6:63,KC_F7:64,KC_F8:65,KC_F9:66,KC_F10:67,KC_F11:68,KC_F12:69,KC_PSCR:70,KC_SLCK:71,KC_PAUS:72,KC_INS:73,KC_HOME:74,KC_PGUP:75,KC_DEL:76,KC_END:77,KC_PGDN:78,KC_RGHT:79,KC_LEFT:80,KC_DOWN:81,KC_UP:82,KC_NLCK:83,KC_PSLS:84,KC_PAST:85,KC_PMNS:86,KC_PPLS:87,KC_PENT:88,KC_P1:89,KC_P2:90,KC_P3:91,KC_P4:92,KC_P5:93,KC_P6:94,KC_P7:95,KC_P8:96,KC_P9:97,KC_P0:98,KC_PDOT:99,KC_NUBS:100,KC_APP:101,KC_POWER:102,KC_PEQL:103,KC_F13:104,KC_F14:105,KC_F15:106,KC_F16:107,KC_F17:108,KC_F18:109,KC_F19:110,KC_F20:111,KC_F21:112,KC_F22:113,KC_F23:114,KC_F24:115,KC_EXECUTE:116,KC_HELP:117,KC_MENU:118,KC_SELECT:119,KC_STOP:120,KC_AGAIN:121,KC_UNDO:122,KC_CUT:123,KC_COPY:124,KC_PASTE:125,KC_FIND:126,KC_LCAP:130,KC_LNUM:131,KC_LSCR:132,KC_PCMM:133,KC_KP_EQUAL_AS400:134,KC_RO:135,KC_KANA:136,KC_JYEN:137,KC_HENK:138,KC_MHEN:139,KC_INT6:140,KC_INT7:141,KC_INT8:142,KC_INT9:143,KC_HAEN:144,KC_HANJ:145,KC_LANG3:146,KC_LANG4:147,KC_LANG5:148,KC_LANG6:149,KC_LANG7:150,KC_LANG8:151,KC_LANG9:152,KC_ERAS:153,KC_SYSREQ:154,KC_CANCEL:155,KC_CLR:156,KC_CLEAR:156,KC_PRIOR:157,KC_OUT:160,KC_OPER:161,KC_CLEAR_AGAIN:162,KC_CRSEL:163,KC_EXSEL:164,KC_PWR:165,KC_SLEP:166,KC_WAKE:167,KC_MUTE:168,KC_VOLU:169,KC_VOLD:170,KC_MNXT:171,KC_MPRV:172,KC_MSTP:173,KC_MPLY:174,KC_MSEL:175,KC_EJCT:176,KC_MAIL:177,KC_CALC:178,KC_MYCM:179,KC_WWW_SEARCH:180,KC_WWW_HOME:181,KC_WWW_BACK:182,KC_WWW_FORWARD:183,KC_WWW_STOP:184,KC_WWW_REFRESH:185,KC_WWW_FAVORITES:186,KC_MFFD:187,KC_MRWD:188,KC_BRIU:189,KC_BRID:190,KC_LCTL:224,KC_LSFT:225,KC_LALT:226,KC_LGUI:227,KC_RCTL:228,KC_RSFT:229,KC_RALT:230,KC_RGUI:231,KC_MS_UP:240,KC_MS_DOWN:241,KC_MS_LEFT:242,KC_MS_RIGHT:243,KC_MS_BTN1:244,KC_MS_BTN2:245,KC_MS_BTN3:246,KC_MS_BTN4:247,KC_MS_BTN5:248,KC_MS_WH_UP:249,KC_MS_WH_DOWN:250,KC_MS_WH_LEFT:251,KC_MS_WH_RIGHT:252,KC_MS_ACCEL0:253,KC_MS_ACCEL1:254,KC_MS_ACCEL2:255,RESET:23552,DEBUG:23553,MAGIC_TOGGLE_NKRO:23572,KC_GESC:23574,AU_ON:23581,AU_OFF:23582,AU_TOG:23583,CLICKY_TOGGLE:23584,CLICKY_ENABLE:23585,CLICKY_DISABLE:23586,CLICKY_UP:23587,CLICKY_DOWN:23588,CLICKY_RESET:23589,MU_ON:23590,MU_OFF:23591,MU_TOG:23592,MU_MOD:23593,BL_ON:23739,BL_OFF:23740,BL_DEC:23741,BL_INC:23742,BL_TOGG:23743,BL_STEP:23744,BL_BRTG:23745,RGB_TOG:23746,RGB_MOD:23747,RGB_RMOD:23748,RGB_HUI:23749,RGB_HUD:23750,RGB_SAI:23751,RGB_SAD:23752,RGB_VAI:23753,RGB_VAD:23754,RGB_SPI:23755,RGB_SPD:23756,RGB_M_P:23757,RGB_M_B:23758,RGB_M_R:23759,RGB_M_SW:23760,RGB_M_SN:23761,RGB_M_K:23762,RGB_M_X:23763,RGB_M_G:23764,KC_LSPO:23767,KC_RSPC:23768,KC_SFTENT:23769,KC_LCPO:23795,KC_RCPC:23796,KC_LAPO:23797,KC_RAPC:23798,BR_INC:24320,BR_DEC:24321,EF_INC:24322,EF_DEC:24323,ES_INC:24324,ES_DEC:24325,H1_INC:24326,H1_DEC:24327,S1_INC:24328,S1_DEC:24329,H2_INC:24330,H2_DEC:24331,S2_INC:24332,S2_DEC:24333,FN_MO13:24336,FN_MO23:24337},v10BasicKeyToByte={_QK_MODS:256,_QK_MODS_MAX:8191,_QK_MOD_TAP:24576,_QK_MOD_TAP_MAX:32767,_QK_LAYER_TAP:16384,_QK_LAYER_TAP_MAX:20479,_QK_LAYER_MOD:22784,_QK_LAYER_MOD_MAX:23039,_QK_TO:20480,_QK_TO_MAX:20511,_QK_MOMENTARY:20736,_QK_MOMENTARY_MAX:20767,_QK_DEF_LAYER:20992,_QK_DEF_LAYER_MAX:21023,_QK_TOGGLE_LAYER:21248,_QK_TOGGLE_LAYER_MAX:21279,_QK_ONE_SHOT_LAYER:21504,_QK_ONE_SHOT_LAYER_MAX:21535,_QK_ONE_SHOT_MOD:21760,_QK_ONE_SHOT_MOD_MAX:22015,_QK_LAYER_TAP_TOGGLE:22528,_QK_LAYER_TAP_TOGGLE_MAX:22559,_QK_LAYER_MOD_MASK:15,_QK_MACRO:24338,_QK_MACRO_MAX:24353,_QK_KB:24448,_QK_KB_MAX:24463,KC_NO:0,KC_TRNS:1,KC_A:4,KC_B:5,KC_C:6,KC_D:7,KC_E:8,KC_F:9,KC_G:10,KC_H:11,KC_I:12,KC_J:13,KC_K:14,KC_L:15,KC_M:16,KC_N:17,KC_O:18,KC_P:19,KC_Q:20,KC_R:21,KC_S:22,KC_T:23,KC_U:24,KC_V:25,KC_W:26,KC_X:27,KC_Y:28,KC_Z:29,KC_1:30,KC_2:31,KC_3:32,KC_4:33,KC_5:34,KC_6:35,KC_7:36,KC_8:37,KC_9:38,KC_0:39,KC_ENT:40,KC_ESC:41,KC_BSPC:42,KC_TAB:43,KC_SPC:44,KC_MINS:45,KC_EQL:46,KC_LBRC:47,KC_RBRC:48,KC_BSLS:49,KC_NUHS:50,KC_SCLN:51,KC_QUOT:52,KC_GRV:53,KC_COMM:54,KC_DOT:55,KC_SLSH:56,KC_CAPS:57,KC_F1:58,KC_F2:59,KC_F3:60,KC_F4:61,KC_F5:62,KC_F6:63,KC_F7:64,KC_F8:65,KC_F9:66,KC_F10:67,KC_F11:68,KC_F12:69,KC_PSCR:70,KC_SLCK:71,KC_PAUS:72,KC_INS:73,KC_HOME:74,KC_PGUP:75,KC_DEL:76,KC_END:77,KC_PGDN:78,KC_RGHT:79,KC_LEFT:80,KC_DOWN:81,KC_UP:82,KC_NLCK:83,KC_PSLS:84,KC_PAST:85,KC_PMNS:86,KC_PPLS:87,KC_PENT:88,KC_P1:89,KC_P2:90,KC_P3:91,KC_P4:92,KC_P5:93,KC_P6:94,KC_P7:95,KC_P8:96,KC_P9:97,KC_P0:98,KC_PDOT:99,KC_NUBS:100,KC_APP:101,KC_POWER:102,KC_PEQL:103,KC_F13:104,KC_F14:105,KC_F15:106,KC_F16:107,KC_F17:108,KC_F18:109,KC_F19:110,KC_F20:111,KC_F21:112,KC_F22:113,KC_F23:114,KC_F24:115,KC_EXECUTE:116,KC_HELP:117,KC_MENU:118,KC_SELECT:119,KC_STOP:120,KC_AGAIN:121,KC_UNDO:122,KC_CUT:123,KC_COPY:124,KC_PASTE:125,KC_FIND:126,KC_LCAP:130,KC_LNUM:131,KC_LSCR:132,KC_PCMM:133,KC_KP_EQUAL_AS400:134,KC_RO:135,KC_KANA:136,KC_JYEN:137,KC_HENK:138,KC_MHEN:139,KC_INT6:140,KC_INT7:141,KC_INT8:142,KC_INT9:143,KC_HAEN:144,KC_HANJ:145,KC_LANG3:146,KC_LANG4:147,KC_LANG5:148,KC_LANG6:149,KC_LANG7:150,KC_LANG8:151,KC_LANG9:152,KC_ERAS:153,KC_SYSREQ:154,KC_CANCEL:155,KC_CLR:156,KC_CLEAR:156,KC_PRIOR:157,KC_OUT:160,KC_OPER:161,KC_CLEAR_AGAIN:162,KC_CRSEL:163,KC_EXSEL:164,KC_PWR:165,KC_SLEP:166,KC_WAKE:167,KC_MUTE:168,KC_VOLU:169,KC_VOLD:170,KC_MNXT:171,KC_MPRV:172,KC_MSTP:173,KC_MPLY:174,KC_MSEL:175,KC_EJCT:176,KC_MAIL:177,KC_CALC:178,KC_MYCM:179,KC_WWW_SEARCH:180,KC_WWW_HOME:181,KC_WWW_BACK:182,KC_WWW_FORWARD:183,KC_WWW_STOP:184,KC_WWW_REFRESH:185,KC_WWW_FAVORITES:186,KC_MFFD:187,KC_MRWD:188,KC_BRIU:189,KC_BRID:190,KC_LCTL:224,KC_LSFT:225,KC_LALT:226,KC_LGUI:227,KC_RCTL:228,KC_RSFT:229,KC_RALT:230,KC_RGUI:231,KC_MS_UP:240,KC_MS_DOWN:241,KC_MS_LEFT:242,KC_MS_RIGHT:243,KC_MS_BTN1:244,KC_MS_BTN2:245,KC_MS_BTN3:246,KC_MS_BTN4:247,KC_MS_BTN5:248,KC_MS_WH_UP:249,KC_MS_WH_DOWN:250,KC_MS_WH_LEFT:251,KC_MS_WH_RIGHT:252,KC_MS_ACCEL0:253,KC_MS_ACCEL1:254,KC_MS_ACCEL2:255,RESET:23552,DEBUG:23553,MAGIC_TOGGLE_NKRO:23572,KC_GESC:23574,AU_ON:23581,AU_OFF:23582,AU_TOG:23583,CLICKY_TOGGLE:23584,CLICKY_ENABLE:23585,CLICKY_DISABLE:23586,CLICKY_UP:23587,CLICKY_DOWN:23588,CLICKY_RESET:23589,MU_ON:23590,MU_OFF:23591,MU_TOG:23592,MU_MOD:23593,BL_ON:23739,BL_OFF:23740,BL_DEC:23741,BL_INC:23742,BL_TOGG:23743,BL_STEP:23744,BL_BRTG:23745,RGB_TOG:23746,RGB_MOD:23747,RGB_RMOD:23748,RGB_HUI:23749,RGB_HUD:23750,RGB_SAI:23751,RGB_SAD:23752,RGB_VAI:23753,RGB_VAD:23754,RGB_SPI:23755,RGB_SPD:23756,RGB_M_P:23757,RGB_M_B:23758,RGB_M_R:23759,RGB_M_SW:23760,RGB_M_SN:23761,RGB_M_K:23762,RGB_M_X:23763,RGB_M_G:23764,KC_LSPO:23767,KC_RSPC:23768,KC_SFTENT:23769,KC_LCPO:23795,KC_RCPC:23796,KC_LAPO:23797,KC_RAPC:23798,BR_INC:24320,BR_DEC:24321,EF_INC:24322,EF_DEC:24323,ES_INC:24324,ES_DEC:24325,H1_INC:24326,H1_DEC:24327,S1_INC:24328,S1_DEC:24329,H2_INC:24330,H2_DEC:24331,S2_INC:24332,S2_DEC:24333,FN_MO13:24336,FN_MO23:24337},v11BasicKeyToByte={_QK_MODS:256,_QK_MODS_MAX:8191,_QK_MOD_TAP:8192,_QK_MOD_TAP_MAX:16383,_QK_LAYER_TAP:16384,_QK_LAYER_TAP_MAX:20479,_QK_LAYER_MOD:20480,_QK_LAYER_MOD_MAX:20991,_QK_TO:20992,_QK_TO_MAX:21023,_QK_MOMENTARY:21024,_QK_MOMENTARY_MAX:21055,_QK_DEF_LAYER:21056,_QK_DEF_LAYER_MAX:21087,_QK_TOGGLE_LAYER:21088,_QK_TOGGLE_LAYER_MAX:21119,_QK_ONE_SHOT_LAYER:21120,_QK_ONE_SHOT_LAYER_MAX:21151,_QK_ONE_SHOT_MOD:21152,_QK_ONE_SHOT_MOD_MAX:21183,_QK_LAYER_TAP_TOGGLE:21184,_QK_LAYER_TAP_TOGGLE_MAX:21215,_QK_LAYER_MOD_MASK:31,_QK_MACRO:30466,_QK_MACRO_MAX:30481,_QK_KB:32512,_QK_KB_MAX:32767,KC_NO:0,KC_TRNS:1,KC_A:4,KC_B:5,KC_C:6,KC_D:7,KC_E:8,KC_F:9,KC_G:10,KC_H:11,KC_I:12,KC_J:13,KC_K:14,KC_L:15,KC_M:16,KC_N:17,KC_O:18,KC_P:19,KC_Q:20,KC_R:21,KC_S:22,KC_T:23,KC_U:24,KC_V:25,KC_W:26,KC_X:27,KC_Y:28,KC_Z:29,KC_1:30,KC_2:31,KC_3:32,KC_4:33,KC_5:34,KC_6:35,KC_7:36,KC_8:37,KC_9:38,KC_0:39,KC_ENT:40,KC_ESC:41,KC_BSPC:42,KC_TAB:43,KC_SPC:44,KC_MINS:45,KC_EQL:46,KC_LBRC:47,KC_RBRC:48,KC_BSLS:49,KC_NUHS:50,KC_SCLN:51,KC_QUOT:52,KC_GRV:53,KC_COMM:54,KC_DOT:55,KC_SLSH:56,KC_CAPS:57,KC_F1:58,KC_F2:59,KC_F3:60,KC_F4:61,KC_F5:62,KC_F6:63,KC_F7:64,KC_F8:65,KC_F9:66,KC_F10:67,KC_F11:68,KC_F12:69,KC_PSCR:70,KC_SLCK:71,KC_PAUS:72,KC_INS:73,KC_HOME:74,KC_PGUP:75,KC_DEL:76,KC_END:77,KC_PGDN:78,KC_RGHT:79,KC_LEFT:80,KC_DOWN:81,KC_UP:82,KC_NLCK:83,KC_PSLS:84,KC_PAST:85,KC_PMNS:86,KC_PPLS:87,KC_PENT:88,KC_P1:89,KC_P2:90,KC_P3:91,KC_P4:92,KC_P5:93,KC_P6:94,KC_P7:95,KC_P8:96,KC_P9:97,KC_P0:98,KC_PDOT:99,KC_NUBS:100,KC_APP:101,KC_POWER:102,KC_PEQL:103,KC_F13:104,KC_F14:105,KC_F15:106,KC_F16:107,KC_F17:108,KC_F18:109,KC_F19:110,KC_F20:111,KC_F21:112,KC_F22:113,KC_F23:114,KC_F24:115,KC_EXECUTE:116,KC_HELP:117,KC_MENU:118,KC_SELECT:119,KC_STOP:120,KC_AGAIN:121,KC_UNDO:122,KC_CUT:123,KC_COPY:124,KC_PASTE:125,KC_FIND:126,KC_LCAP:130,KC_LNUM:131,KC_LSCR:132,KC_PCMM:133,KC_KP_EQUAL_AS400:134,KC_RO:135,KC_KANA:136,KC_JYEN:137,KC_HENK:138,KC_MHEN:139,KC_INT6:140,KC_INT7:141,KC_INT8:142,KC_INT9:143,KC_HAEN:144,KC_HANJ:145,KC_LANG3:146,KC_LANG4:147,KC_LANG5:148,KC_LANG6:149,KC_LANG7:150,KC_LANG8:151,KC_LANG9:152,KC_ERAS:153,KC_SYSREQ:154,KC_CANCEL:155,KC_CLR:156,KC_CLEAR:156,KC_PRIOR:157,KC_OUT:160,KC_OPER:161,KC_CLEAR_AGAIN:162,KC_CRSEL:163,KC_EXSEL:164,KC_PWR:165,KC_SLEP:166,KC_WAKE:167,KC_MUTE:168,KC_VOLU:169,KC_VOLD:170,KC_MNXT:171,KC_MPRV:172,KC_MSTP:173,KC_MPLY:174,KC_MSEL:175,KC_EJCT:176,KC_MAIL:177,KC_CALC:178,KC_MYCM:179,KC_WWW_SEARCH:180,KC_WWW_HOME:181,KC_WWW_BACK:182,KC_WWW_FORWARD:183,KC_WWW_STOP:184,KC_WWW_REFRESH:185,KC_WWW_FAVORITES:186,KC_MFFD:187,KC_MRWD:188,KC_BRIU:189,KC_BRID:190,KC_MS_UP:205,KC_MS_DOWN:206,KC_MS_LEFT:207,KC_MS_RIGHT:208,KC_MS_BTN1:209,KC_MS_BTN2:210,KC_MS_BTN3:211,KC_MS_BTN4:212,KC_MS_BTN5:213,KC_MS_BTN6:214,KC_MS_BTN7:215,KC_MS_BTN8:216,KC_MS_WH_UP:217,KC_MS_WH_DOWN:218,KC_MS_WH_LEFT:219,KC_MS_WH_RIGHT:220,KC_MS_ACCEL0:221,KC_MS_ACCEL1:222,KC_MS_ACCEL2:223,KC_LCTL:224,KC_LSFT:225,KC_LALT:226,KC_LGUI:227,KC_RCTL:228,KC_RSFT:229,KC_RALT:230,KC_RGUI:231,RESET:31744,DEBUG:31746,MAGIC_TOGGLE_NKRO:28691,KC_GESC:31766,KC_ASUP:31761,KC_ASDN:31760,KC_ASRP:31762,KC_ASTG:31765,KC_ASON:31763,KC_ASOFF:31764,AU_ON:29824,AU_OFF:29825,AU_TOG:29826,CLICKY_TOGGLE:29834,CLICKY_ENABLE:29835,CLICKY_DISABLE:29836,CLICKY_UP:29837,CLICKY_DOWN:29838,CLICKY_RESET:29839,MU_ON:29840,MU_OFF:29841,MU_TOG:29842,MU_MOD:29843,MI_ON:28928,MI_OFF:28929,MI_TOG:28930,MI_C:28944,MI_Cs:28945,MI_D:28946,MI_Ds:28947,MI_E:28948,MI_F:28949,MI_Fs:28950,MI_G:28951,MI_Gs:28952,MI_A:28953,MI_As:28954,MI_B:28955,MI_C_1:28960,MI_Cs_1:28961,MI_D_1:28962,MI_Ds_1:28963,MI_E_1:28964,MI_F_1:28965,MI_Fs_1:28966,MI_G_1:28967,MI_Gs_1:28968,MI_A_1:28969,MI_As_1:28970,MI_B_1:28971,MI_C_2:28976,MI_Cs_2:28977,MI_D_2:28978,MI_Ds_2:28979,MI_E_2:28980,MI_F_2:28981,MI_Fs_2:28982,MI_G_2:28983,MI_Gs_2:28984,MI_A_2:28985,MI_As_2:28986,MI_B_2:28987,MI_C_3:28992,MI_Cs_3:28993,MI_D_3:28994,MI_Ds_3:28995,MI_E_3:28996,MI_F_3:28997,MI_Fs_3:28998,MI_G_3:28999,MI_Gs_3:29e3,MI_A_3:29001,MI_As_3:29002,MI_B_3:29003,MI_C_4:29008,MI_Cs_4:29009,MI_D_4:29010,MI_Ds_4:29011,MI_E_4:29012,MI_F_4:29013,MI_Fs_4:29014,MI_G_4:29015,MI_Gs_4:29016,MI_A_4:29017,MI_As_4:29018,MI_B_4:29019,MI_C_5:29024,MI_Cs_5:29025,MI_D_5:29026,MI_Ds_5:29027,MI_E_5:29028,MI_F_5:29029,MI_Fs_5:29030,MI_G_5:29031,MI_Gs_5:29032,MI_A_5:29033,MI_As_5:29034,MI_B_5:29035,MI_OCT_N2:29040,MI_OCT_N1:29041,MI_OCT_0:29042,MI_OCT_1:29043,MI_OCT_2:29044,MI_OCT_3:29045,MI_OCT_4:29046,MI_OCT_5:29047,MI_OCT_6:29048,MI_OCT_7:29049,MI_OCTD:29050,MI_OCTU:29051,MI_TRNS_N6:29056,MI_TRNS_N5:29057,MI_TRNS_N4:29058,MI_TRNS_N3:29059,MI_TRNS_N2:29060,MI_TRNS_N1:29061,MI_TRNS_0:29062,MI_TRNS_1:29063,MI_TRNS_2:29064,MI_TRNS_3:29065,MI_TRNS_4:29066,MI_TRNS_5:29067,MI_TRNS_6:29068,MI_TRNSD:29069,MI_TRNSU:29070,MI_VEL_0:29072,MI_VEL_1:29073,MI_VEL_2:29074,MI_VEL_3:29075,MI_VEL_4:29076,MI_VEL_5:29077,MI_VEL_6:29078,MI_VEL_7:29079,MI_VEL_8:29080,MI_VEL_9:29081,MI_VEL_10:29082,MI_VELD:29083,MI_VELU:29084,MI_CH1:29088,MI_CH2:29089,MI_CH3:29090,MI_CH4:29091,MI_CH5:29092,MI_CH6:29093,MI_CH7:29094,MI_CH8:29095,MI_CH9:29096,MI_CH10:29097,MI_CH11:29098,MI_CH12:29099,MI_CH13:29100,MI_CH14:29101,MI_CH15:29102,MI_CH16:29103,MI_CHD:29104,MI_CHU:29105,MI_ALLOFF:29120,MI_SUST:29121,MI_PORT:29122,MI_SOST:29123,MI_SOFT:29124,MI_LEG:29125,MI_MOD:29126,MI_MODSD:29127,MI_MODSU:29128,MI_BENDD:29129,MI_BENDU:29130,BL_ON:30720,BL_OFF:30721,BL_DEC:30723,BL_INC:30724,BL_TOGG:30722,BL_STEP:30725,BL_BRTG:30726,RGB_TOG:30752,RGB_MOD:30753,RGB_RMOD:30754,RGB_HUI:30755,RGB_HUD:30756,RGB_SAI:30757,RGB_SAD:30758,RGB_VAI:30759,RGB_VAD:30760,RGB_SPI:30761,RGB_SPD:30762,RGB_M_P:30763,RGB_M_B:30764,RGB_M_R:30765,RGB_M_SW:30766,RGB_M_SN:30767,RGB_M_K:30768,RGB_M_X:30769,RGB_M_G:30770,RGB_MODE_RGBTEST:30771,VLK_TOG:31767,KC_LSPO:31770,KC_RSPC:31771,KC_SFTENT:31774,OUT_AUTO:31776,OUT_USB:31777,QK_CLEAR_EEPROM:31747,HPT_ON:31808,HPT_OFF:31809,HPT_TOG:31810,HPT_RST:31811,HPT_FBK:31812,HPT_BUZ:31813,HPT_MODI:31814,HPT_MODD:31815,HPT_CONT:31816,HPT_CONI:31817,HPT_COND:31818,HPT_DWLI:31819,HPT_DWLD:31820,KC_LCPO:31768,KC_RCPC:31769,KC_LAPO:31772,KC_RAPC:31773,CMB_ON:31824,CMB_OFF:31825,CMB_TOG:31826,MAGIC_SWAP_LCTL_LGUI:28695,MAGIC_SWAP_RCTL_RGUI:28697,MAGIC_UNSWAP_LCTL_LGUI:28696,MAGIC_UNSWAP_RCTL_RGUI:28698,MAGIC_SWAP_CTL_GUI:28699,MAGIC_UNSWAP_CTL_GUI:28700,MAGIC_TOGGLE_CTL_GUI:28701,MAGIC_EE_HANDS_LEFT:28702,MAGIC_EE_HANDS_RIGHT:28703,DYN_REC_START1:31827,DYN_REC_START2:31828,DYN_REC_STOP:31829,DYN_MACRO_PLAY1:31830,DYN_MACRO_PLAY2:31831,FN_MO13:30464,FN_MO23:30465},v12BasicKeyToByte={_QK_MODS:256,_QK_MODS_MAX:8191,_QK_MOD_TAP:8192,_QK_MOD_TAP_MAX:16383,_QK_LAYER_TAP:16384,_QK_LAYER_TAP_MAX:20479,_QK_LAYER_MOD:20480,_QK_LAYER_MOD_MAX:20991,_QK_TO:20992,_QK_TO_MAX:21023,_QK_MOMENTARY:21024,_QK_MOMENTARY_MAX:21055,_QK_DEF_LAYER:21056,_QK_DEF_LAYER_MAX:21087,_QK_TOGGLE_LAYER:21088,_QK_TOGGLE_LAYER_MAX:21119,_QK_ONE_SHOT_LAYER:21120,_QK_ONE_SHOT_LAYER_MAX:21151,_QK_ONE_SHOT_MOD:21152,_QK_ONE_SHOT_MOD_MAX:21183,_QK_LAYER_TAP_TOGGLE:21184,_QK_LAYER_TAP_TOGGLE_MAX:21215,_QK_LAYER_MOD_MASK:31,_QK_MACRO:30464,_QK_MACRO_MAX:30591,_QK_KB:32256,_QK_KB_MAX:32511,KC_NO:0,KC_TRNS:1,KC_A:4,KC_B:5,KC_C:6,KC_D:7,KC_E:8,KC_F:9,KC_G:10,KC_H:11,KC_I:12,KC_J:13,KC_K:14,KC_L:15,KC_M:16,KC_N:17,KC_O:18,KC_P:19,KC_Q:20,KC_R:21,KC_S:22,KC_T:23,KC_U:24,KC_V:25,KC_W:26,KC_X:27,KC_Y:28,KC_Z:29,KC_1:30,KC_2:31,KC_3:32,KC_4:33,KC_5:34,KC_6:35,KC_7:36,KC_8:37,KC_9:38,KC_0:39,KC_ENT:40,KC_ESC:41,KC_BSPC:42,KC_TAB:43,KC_SPC:44,KC_MINS:45,KC_EQL:46,KC_LBRC:47,KC_RBRC:48,KC_BSLS:49,KC_NUHS:50,KC_SCLN:51,KC_QUOT:52,KC_GRV:53,KC_COMM:54,KC_DOT:55,KC_SLSH:56,KC_CAPS:57,KC_F1:58,KC_F2:59,KC_F3:60,KC_F4:61,KC_F5:62,KC_F6:63,KC_F7:64,KC_F8:65,KC_F9:66,KC_F10:67,KC_F11:68,KC_F12:69,KC_PSCR:70,KC_SLCK:71,KC_PAUS:72,KC_INS:73,KC_HOME:74,KC_PGUP:75,KC_DEL:76,KC_END:77,KC_PGDN:78,KC_RGHT:79,KC_LEFT:80,KC_DOWN:81,KC_UP:82,KC_NLCK:83,KC_PSLS:84,KC_PAST:85,KC_PMNS:86,KC_PPLS:87,KC_PENT:88,KC_P1:89,KC_P2:90,KC_P3:91,KC_P4:92,KC_P5:93,KC_P6:94,KC_P7:95,KC_P8:96,KC_P9:97,KC_P0:98,KC_PDOT:99,KC_NUBS:100,KC_APP:101,KC_POWER:102,KC_PEQL:103,KC_F13:104,KC_F14:105,KC_F15:106,KC_F16:107,KC_F17:108,KC_F18:109,KC_F19:110,KC_F20:111,KC_F21:112,KC_F22:113,KC_F23:114,KC_F24:115,KC_EXECUTE:116,KC_HELP:117,KC_MENU:118,KC_SELECT:119,KC_STOP:120,KC_AGAIN:121,KC_UNDO:122,KC_CUT:123,KC_COPY:124,KC_PASTE:125,KC_FIND:126,KC_LCAP:130,KC_LNUM:131,KC_LSCR:132,KC_PCMM:133,KC_KP_EQUAL_AS400:134,KC_RO:135,KC_KANA:136,KC_JYEN:137,KC_HENK:138,KC_MHEN:139,KC_INT6:140,KC_INT7:141,KC_INT8:142,KC_INT9:143,KC_HAEN:144,KC_HANJ:145,KC_LANG3:146,KC_LANG4:147,KC_LANG5:148,KC_LANG6:149,KC_LANG7:150,KC_LANG8:151,KC_LANG9:152,KC_ERAS:153,KC_SYSREQ:154,KC_CANCEL:155,KC_CLR:156,KC_CLEAR:156,KC_PRIOR:157,KC_OUT:160,KC_OPER:161,KC_CLEAR_AGAIN:162,KC_CRSEL:163,KC_EXSEL:164,KC_PWR:165,KC_SLEP:166,KC_WAKE:167,KC_MUTE:168,KC_VOLU:169,KC_VOLD:170,KC_MNXT:171,KC_MPRV:172,KC_MSTP:173,KC_MPLY:174,KC_MSEL:175,KC_EJCT:176,KC_MAIL:177,KC_CALC:178,KC_MYCM:179,KC_WWW_SEARCH:180,KC_WWW_HOME:181,KC_WWW_BACK:182,KC_WWW_FORWARD:183,KC_WWW_STOP:184,KC_WWW_REFRESH:185,KC_WWW_FAVORITES:186,KC_MFFD:187,KC_MRWD:188,KC_BRIU:189,KC_BRID:190,KC_MS_UP:205,KC_MS_DOWN:206,KC_MS_LEFT:207,KC_MS_RIGHT:208,KC_MS_BTN1:209,KC_MS_BTN2:210,KC_MS_BTN3:211,KC_MS_BTN4:212,KC_MS_BTN5:213,KC_MS_BTN6:214,KC_MS_BTN7:215,KC_MS_BTN8:216,KC_MS_WH_UP:217,KC_MS_WH_DOWN:218,KC_MS_WH_LEFT:219,KC_MS_WH_RIGHT:220,KC_MS_ACCEL0:221,KC_MS_ACCEL1:222,KC_MS_ACCEL2:223,KC_LCTL:224,KC_LSFT:225,KC_LALT:226,KC_LGUI:227,KC_RCTL:228,KC_RSFT:229,KC_RALT:230,KC_RGUI:231,RESET:31744,DEBUG:31746,MAGIC_TOGGLE_NKRO:28691,KC_GESC:31766,KC_ASUP:31761,KC_ASDN:31760,KC_ASRP:31762,KC_ASTG:31765,KC_ASON:31763,KC_ASOFF:31764,AU_ON:29824,AU_OFF:29825,AU_TOG:29826,CLICKY_TOGGLE:29834,CLICKY_ENABLE:29835,CLICKY_DISABLE:29836,CLICKY_UP:29837,CLICKY_DOWN:29838,CLICKY_RESET:29839,MU_ON:29840,MU_OFF:29841,MU_TOG:29842,MU_MOD:29843,MI_ON:28928,MI_OFF:28929,MI_TOG:28930,MI_C:28944,MI_Cs:28945,MI_D:28946,MI_Ds:28947,MI_E:28948,MI_F:28949,MI_Fs:28950,MI_G:28951,MI_Gs:28952,MI_A:28953,MI_As:28954,MI_B:28955,MI_C_1:28960,MI_Cs_1:28961,MI_D_1:28962,MI_Ds_1:28963,MI_E_1:28964,MI_F_1:28965,MI_Fs_1:28966,MI_G_1:28967,MI_Gs_1:28968,MI_A_1:28969,MI_As_1:28970,MI_B_1:28971,MI_C_2:28976,MI_Cs_2:28977,MI_D_2:28978,MI_Ds_2:28979,MI_E_2:28980,MI_F_2:28981,MI_Fs_2:28982,MI_G_2:28983,MI_Gs_2:28984,MI_A_2:28985,MI_As_2:28986,MI_B_2:28987,MI_C_3:28992,MI_Cs_3:28993,MI_D_3:28994,MI_Ds_3:28995,MI_E_3:28996,MI_F_3:28997,MI_Fs_3:28998,MI_G_3:28999,MI_Gs_3:29e3,MI_A_3:29001,MI_As_3:29002,MI_B_3:29003,MI_C_4:29008,MI_Cs_4:29009,MI_D_4:29010,MI_Ds_4:29011,MI_E_4:29012,MI_F_4:29013,MI_Fs_4:29014,MI_G_4:29015,MI_Gs_4:29016,MI_A_4:29017,MI_As_4:29018,MI_B_4:29019,MI_C_5:29024,MI_Cs_5:29025,MI_D_5:29026,MI_Ds_5:29027,MI_E_5:29028,MI_F_5:29029,MI_Fs_5:29030,MI_G_5:29031,MI_Gs_5:29032,MI_A_5:29033,MI_As_5:29034,MI_B_5:29035,MI_OCT_N2:29040,MI_OCT_N1:29041,MI_OCT_0:29042,MI_OCT_1:29043,MI_OCT_2:29044,MI_OCT_3:29045,MI_OCT_4:29046,MI_OCT_5:29047,MI_OCT_6:29048,MI_OCT_7:29049,MI_OCTD:29050,MI_OCTU:29051,MI_TRNS_N6:29056,MI_TRNS_N5:29057,MI_TRNS_N4:29058,MI_TRNS_N3:29059,MI_TRNS_N2:29060,MI_TRNS_N1:29061,MI_TRNS_0:29062,MI_TRNS_1:29063,MI_TRNS_2:29064,MI_TRNS_3:29065,MI_TRNS_4:29066,MI_TRNS_5:29067,MI_TRNS_6:29068,MI_TRNSD:29069,MI_TRNSU:29070,MI_VEL_0:29072,MI_VEL_1:29073,MI_VEL_2:29074,MI_VEL_3:29075,MI_VEL_4:29076,MI_VEL_5:29077,MI_VEL_6:29078,MI_VEL_7:29079,MI_VEL_8:29080,MI_VEL_9:29081,MI_VEL_10:29082,MI_VELD:29083,MI_VELU:29084,MI_CH1:29088,MI_CH2:29089,MI_CH3:29090,MI_CH4:29091,MI_CH5:29092,MI_CH6:29093,MI_CH7:29094,MI_CH8:29095,MI_CH9:29096,MI_CH10:29097,MI_CH11:29098,MI_CH12:29099,MI_CH13:29100,MI_CH14:29101,MI_CH15:29102,MI_CH16:29103,MI_CHD:29104,MI_CHU:29105,MI_ALLOFF:29120,MI_SUST:29121,MI_PORT:29122,MI_SOST:29123,MI_SOFT:29124,MI_LEG:29125,MI_MOD:29126,MI_MODSD:29127,MI_MODSU:29128,MI_BENDD:29129,MI_BENDU:29130,BL_ON:30720,BL_OFF:30721,BL_DEC:30723,BL_INC:30724,BL_TOGG:30722,BL_STEP:30725,BL_BRTG:30726,RGB_TOG:30752,RGB_MOD:30753,RGB_RMOD:30754,RGB_HUI:30755,RGB_HUD:30756,RGB_SAI:30757,RGB_SAD:30758,RGB_VAI:30759,RGB_VAD:30760,RGB_SPI:30761,RGB_SPD:30762,RGB_M_P:30763,RGB_M_B:30764,RGB_M_R:30765,RGB_M_SW:30766,RGB_M_SN:30767,RGB_M_K:30768,RGB_M_X:30769,RGB_M_G:30770,RGB_MODE_RGBTEST:30771,VLK_TOG:31767,KC_LSPO:31770,KC_RSPC:31771,KC_SFTENT:31774,OUT_AUTO:31776,OUT_USB:31777,QK_CLEAR_EEPROM:31747,HPT_ON:31808,HPT_OFF:31809,HPT_TOG:31810,HPT_RST:31811,HPT_FBK:31812,HPT_BUZ:31813,HPT_MODI:31814,HPT_MODD:31815,HPT_CONT:31816,HPT_CONI:31817,HPT_COND:31818,HPT_DWLI:31819,HPT_DWLD:31820,KC_LCPO:31768,KC_RCPC:31769,KC_LAPO:31772,KC_RAPC:31773,CMB_ON:31824,CMB_OFF:31825,CMB_TOG:31826,MAGIC_SWAP_LCTL_LGUI:28695,MAGIC_SWAP_RCTL_RGUI:28697,MAGIC_UNSWAP_LCTL_LGUI:28696,MAGIC_UNSWAP_RCTL_RGUI:28698,MAGIC_SWAP_CTL_GUI:28699,MAGIC_UNSWAP_CTL_GUI:28700,MAGIC_TOGGLE_CTL_GUI:28701,MAGIC_EE_HANDS_LEFT:28702,MAGIC_EE_HANDS_RIGHT:28703,DYN_REC_START1:31827,DYN_REC_START2:31828,DYN_REC_STOP:31829,DYN_MACRO_PLAY1:31830,DYN_MACRO_PLAY2:31831,FN_MO13:31863,FN_MO23:31864};function getBasicKeyDict(e){switch(e){case 13:case 12:return v12BasicKeyToByte;case 11:return v11BasicKeyToByte;case 10:return v10BasicKeyToByte;default:return basicKeyToByte}}const autocompleteKeycodes={KC_NO:!0,KC_A:!0,KC_B:!0,KC_C:!0,KC_D:!0,KC_E:!0,KC_F:!0,KC_G:!0,KC_H:!0,KC_I:!0,KC_J:!0,KC_K:!0,KC_L:!0,KC_M:!0,KC_N:!0,KC_O:!0,KC_P:!0,KC_Q:!0,KC_R:!0,KC_S:!0,KC_T:!0,KC_U:!0,KC_V:!0,KC_W:!0,KC_X:!0,KC_Y:!0,KC_Z:!0,KC_1:!0,KC_2:!0,KC_3:!0,KC_4:!0,KC_5:!0,KC_6:!0,KC_7:!0,KC_8:!0,KC_9:!0,KC_0:!0,KC_ENT:!0,KC_ESC:!0,KC_BSPC:!0,KC_TAB:!0,KC_SPC:!0,KC_MINS:!0,KC_EQL:!0,KC_LBRC:!0,KC_RBRC:!0,KC_BSLS:!0,KC_NUHS:!0,KC_SCLN:!0,KC_QUOT:!0,KC_GRV:!0,KC_COMM:!0,KC_DOT:!0,KC_SLSH:!0,KC_CAPS:!0,KC_F1:!0,KC_F2:!0,KC_F3:!0,KC_F4:!0,KC_F5:!0,KC_F6:!0,KC_F7:!0,KC_F8:!0,KC_F9:!0,KC_F10:!0,KC_F11:!0,KC_F12:!0,KC_PSCR:!0,KC_SLCK:!0,KC_PAUS:!0,KC_INS:!0,KC_HOME:!0,KC_PGUP:!0,KC_DEL:!0,KC_END:!0,KC_PGDN:!0,KC_RGHT:!0,KC_LEFT:!0,KC_DOWN:!0,KC_UP:!0,KC_NLCK:!0,KC_PSLS:!0,KC_KP_ASTERISK:!0,KC_PAST:!0,KC_PPLS:!0,KC_PMNS:!0,KC_PENT:!0,KC_P1:!0,KC_P2:!0,KC_P3:!0,KC_P4:!0,KC_P5:!0,KC_P6:!0,KC_P7:!0,KC_P8:!0,KC_P9:!0,KC_P0:!0,KC_PDOT:!0,KC_NUBS:!0,KC_APP:!0,KC_POWER:!0,KC_PEQL:!0,KC_F13:!0,KC_F14:!0,KC_F15:!0,KC_F16:!0,KC_F17:!0,KC_F18:!0,KC_F19:!0,KC_F20:!0,KC_F21:!0,KC_F22:!0,KC_F23:!0,KC_F24:!0,KC_EXECUTE:!0,KC_HELP:!0,KC_MENU:!0,KC_SELECT:!0,KC_STOP:!0,KC_AGAIN:!0,KC_UNDO:!0,KC_CUT:!0,KC_COPY:!0,KC_PASTE:!0,KC_FIND:!0,KC_LCAP:!0,KC_LNUM:!0,KC_LSCR:!0,KC_PCMM:!0,KC_KP_EQUAL_AS400:!0,KC_RO:!0,KC_KANA:!0,KC_JYEN:!0,KC_HENK:!0,KC_MHEN:!0,KC_INT6:!0,KC_INT7:!0,KC_INT8:!0,KC_INT9:!0,KC_HAEN:!0,KC_HANJ:!0,KC_LANG3:!0,KC_LANG4:!0,KC_LANG5:!0,KC_LANG6:!0,KC_LANG7:!0,KC_LANG8:!0,KC_LANG9:!0,KC_SYSREQ:!0,KC_CANCEL:!0,KC_CLEAR:!0,KC_PRIOR:!0,KC_OUT:!0,KC_OPER:!0,KC_CLEAR_AGAIN:!0,KC_CRSEL:!0,KC_EXSEL:!0,KC_LCTL:!0,KC_LSFT:!0,KC_LALT:!0,KC_LGUI:!0,KC_RCTL:!0,KC_RSFT:!0,KC_RALT:!0,KC_RGUI:!0,KC_PWR:!0,KC_SLEP:!0,KC_WAKE:!0,KC_MUTE:!0,KC_VOLU:!0,KC_VOLD:!0,KC_MNXT:!0,KC_MPRV:!0,KC_MSTP:!0,KC_MPLY:!0,KC_MSEL:!0,KC_EJCT:!0,KC_MAIL:!0,KC_CALC:!0,KC_MYCM:!0,KC_WWW_SEARCH:!0,KC_WWW_HOME:!0,KC_WWW_BACK:!0,KC_WWW_FORWARD:!0,KC_WWW_STOP:!0,KC_WWW_REFRESH:!0,KC_WWW_FAVORITES:!0,KC_MFFD:!0,KC_MRWD:!0},getAutocompleteKeycodes=()=>keycodesList.filter(e=>!!autocompleteKeycodes[e.code]);function isAutocompleteKeycode(e){const t=e.toUpperCase();return!!autocompleteKeycodes[t]}var RawKeycodeSequenceAction=(e=>(e[e.Tap=1]="Tap",e[e.Down=2]="Down",e[e.Up=3]="Up",e[e.Delay=4]="Delay",e[e.CharacterStream=5]="CharacterStream",e))(RawKeycodeSequenceAction||{}),GroupedKeycodeSequenceAction=(e=>(e[e.Chord=6]="Chord",e))(GroupedKeycodeSequenceAction||{}),KeyAction=(e=>(e[e.Tap=1]="Tap",e[e.Down=2]="Down",e[e.Up=3]="Up",e[e.Delay=4]="Delay",e))(KeyAction||{});const KeyActionPrefix=1,DelayTerminator=124,MacroTerminator=0;function splitExpression(expression){let regex;try{return regex=eval("/(?<!\\\\)({.*?})/g"),expression.split(regex).filter(e=>e.length)}catch(e){return console.error("Lookbehind is not supported in this browser."),[]}}function optimizedSequenceToRawSequence(e){return e.flatMap(t=>{if(t[0]==GroupedKeycodeSequenceAction.Chord){const o=n=>r=>[n,r];return[...t[1]].map(o(RawKeycodeSequenceAction.Down)).concat([...t[1]].reverse().map(o(RawKeycodeSequenceAction.Up)))}else return[t]})}function rawSequenceToOptimizedSequence(e){let t=[];return t=convertToTapsAndChords(e),t}function convertToTapsAndChords(e){let t=[],o=[],n=0;const r=e.reduce((i,c)=>c[0]===RawKeycodeSequenceAction.Tap?[...i,[RawKeycodeSequenceAction.Down,c[1]],[RawKeycodeSequenceAction.Up,c[1]]]:[...i,c],[]);let s=[];r.forEach((i,c)=>{let l=!1;if(t.push(i),i[0]===RawKeycodeSequenceAction.Down)n==o.length&&(o.push(i[1]),n++,l=!0);else if(i[0]===RawKeycodeSequenceAction.Up){const d=i[1];o.length>0&&d===o[n-1]&&(n--,n==0?(o.length===1?s.push([RawKeycodeSequenceAction.Tap,o[0]]):s.push([GroupedKeycodeSequenceAction.Chord,o]),t=[]):l=!0)}c===r.length-1&&(l=!1),l||(s.push(...t),t=[],o=[],n=0)});let a=[];for(let i=0;i<s.length;i++)i+1<s.length&&s[i][0]==RawKeycodeSequenceAction.Down&&s[i+1][0]==RawKeycodeSequenceAction.Up&&s[i][1]===s[i+1][1]?(a.push([RawKeycodeSequenceAction.Tap,s[i][1]]),i++):a.push(s[i]);return a}const mapKeycodeToCharacterStream={KC_A:["a","A"],KC_B:["b","B"],KC_C:["c","C"],KC_D:["d","D"],KC_E:["e","E"],KC_F:["f","F"],KC_G:["g","G"],KC_H:["h","H"],KC_I:["i","I"],KC_J:["j","J"],KC_K:["k","K"],KC_L:["l","L"],KC_M:["m","M"],KC_N:["n","N"],KC_O:["o","O"],KC_P:["p","P"],KC_Q:["q","Q"],KC_R:["r","R"],KC_S:["s","S"],KC_T:["t","T"],KC_U:["u","U"],KC_V:["v","V"],KC_W:["w","W"],KC_X:["x","X"],KC_Y:["y","Y"],KC_Z:["z","Z"],KC_1:["1","!"],KC_2:["2","@"],KC_3:["3","#"],KC_4:["4","$"],KC_5:["5","%"],KC_6:["6","^"],KC_7:["7","&"],KC_8:["8","*"],KC_9:["9","("],KC_0:["0",")"],KC_SPC:[" "," "],KC_MINS:["-","_"],KC_EQL:["=","+"],KC_LBRC:["[","{"],KC_RBRC:["]","}"],KC_BSLS:["\\","|"],KC_SCLN:[";",":"],KC_QUOT:["'",'"'],KC_GRV:["`","~"],KC_COMM:[",","<"],KC_DOT:[".",">"],KC_SLSH:["/","?"]},mapCharToShiftedChar=Object.values(mapKeycodeToCharacterStream).reduce((e,[t,o])=>({...e,[t]:o}),{});function convertCharacterTaps(e){return e.reduce((o,n)=>n[0]==RawKeycodeSequenceAction.Down&&n[1]in mapKeycodeToCharacterStream?[...o,[RawKeycodeSequenceAction.Tap,n[1]]]:n[0]==RawKeycodeSequenceAction.Up&&n[1]in mapKeycodeToCharacterStream?o:[...o,n],[])}function trimLastWait(e){return e[e.length-1]&&e[e.length-1][0]===RawKeycodeSequenceAction.Delay?e.slice(0,-1):e}function mergeConsecutiveWaits(e){return e.reduce((t,o)=>(t[t.length-1]&&t[t.length-1][0]===RawKeycodeSequenceAction.Delay&&o[0]===RawKeycodeSequenceAction.Delay?t.splice(-1,1,[RawKeycodeSequenceAction.Delay,Number(t[t.length-1][1])+Number(o[1])]):t.push(o),t),[])}function foldKeydownKeyupKeys(e){return e.reduce((t,o)=>(t[t.length-1]&&t[t.length-1][0]===RawKeycodeSequenceAction.Down&&o[0]===RawKeycodeSequenceAction.Up&&t[t.length-1][1]===o[1]?t.splice(-1,1,[RawKeycodeSequenceAction.Tap,o[1]]):t.push(o),t),[])}function convertToCharacterStreams(e){let t=e.reduce((r,s)=>{if(s[0]==RawKeycodeSequenceAction.Tap&&s[1]in mapKeycodeToCharacterStream){const a=mapKeycodeToCharacterStream[s[1]][0];return r[r.length-1]!==void 0&&r[r.length-1][0]===RawKeycodeSequenceAction.CharacterStream?[...r.slice(0,-1),[RawKeycodeSequenceAction.CharacterStream,r[r.length-1][1]+a]]:[...r,[RawKeycodeSequenceAction.CharacterStream,a]]}else return[...r,s]},[]),o=[];for(let r=0;r<t.length;r++)if(r+2<t.length&&t[r][0]===RawKeycodeSequenceAction.Down&&t[r+1][0]===RawKeycodeSequenceAction.CharacterStream&&t[r+2][0]===RawKeycodeSequenceAction.Up&&t[r][1]===t[r+2][1]&&(t[r][1]==="KC_LSFT"||t[r][1]==="KC_RSFT")){const s=t[r+1][1].split("").map(a=>mapCharToShiftedChar[a]).join("");o.push([RawKeycodeSequenceAction.CharacterStream,s]),r+=2}else o.push(t[r]);return o.reduce((r,s)=>s[0]===RawKeycodeSequenceAction.CharacterStream&&r[r.length-1]!==void 0&&r[r.length-1][0]===RawKeycodeSequenceAction.CharacterStream?(r[r.length-1][1]=r[r.length-1][1].concat(s[1]),r):[...r,s],[])}function sequenceToExpression(e){let t=[];return e.forEach(o=>{switch(o[0]){case RawKeycodeSequenceAction.Tap:t.push("{"+o[1]+"}");break;case RawKeycodeSequenceAction.Down:t.push("{+"+o[1]+"}");break;case RawKeycodeSequenceAction.Up:t.push("{-"+o[1]+"}");break;case RawKeycodeSequenceAction.Delay:t.push("{"+o[1]+"}");break;case GroupedKeycodeSequenceAction.Chord:t.push("{"+o[1].join(",")+"}");break;case RawKeycodeSequenceAction.CharacterStream:t.push(o[1].replace(/{/g,"\\{"))}}),t.join("")}function expressionToSequence(e){let t=splitExpression(e),o=[];return t.forEach(n=>{if(/^{.*}$/.test(n))if(n=n.slice(1,-1),/^\d+$/.test(n))o.push([RawKeycodeSequenceAction.Delay,parseInt(n)]);else{const r=/^[+-]/.test(n)?n.slice(0,1):null,s=n.replace(/^[+-]/,"").split(",").map(a=>a.trim().toUpperCase()).filter(a=>a.length);if(s.length>0)if(r==null)s.length==1?o.push([RawKeycodeSequenceAction.Tap,s[0]]):o.push([GroupedKeycodeSequenceAction.Chord,s]);else{const a=r=="+"?RawKeycodeSequenceAction.Down:RawKeycodeSequenceAction.Up;o.push([a,s[0]])}}else n=n.replace(/\\{/g,"{"),o.push([RawKeycodeSequenceAction.CharacterStream,n])}),o}function validateMacroExpression(expression){let unclosedBlockRegex,keycodeBlockRegex;try{unclosedBlockRegex=eval("/(?<!\\\\){(?![^{]*})/"),keycodeBlockRegex=eval("/(?<!\\\\){(.*?)}/g")}catch(e){return console.error("Lookbehind is not supported in this browser."),{isValid:!1,errorMessage:"Lookbehind is not supported in this browser."}}if(expression.match(unclosedBlockRegex))return{isValid:!1,errorMessage:"Looks like a keycode block - {} - is unclosed! Are you missing an '}'?"};let groups=null;for(;groups=keycodeBlockRegex.exec(expression);){const e=groups[1].replace(/\s+/g,"");if(!e.length)return{isValid:!1,errorMessage:"Sorry, I can't handle empty {}. Fill them up with keycodes or use \\{} to tell the macro to literally type {}"};const t=e.split(",").filter(o=>o.trim().length&&!isAutocompleteKeycode(o));if(t.length)return{isValid:!1,errorMessage:`Whoops! Invalid keycodes detected inside {}: ${t.join(", ")}`}}return{isValid:!0,errorMessage:void 0}}class MacroAPI{constructor(t,o,n){this.keyboardApi=t,this.basicKeyToByte=o,this.byteToKey=n}async readRawKeycodeSequences(){const t=await this.keyboardApi.getMacroBytes(),o=await this.keyboardApi.getMacroCount();let n=0,r=0;const s=[];let a=[];if(o===0)throw Error("Macros are disabled");for(;r<t.length&&n<o;){let i=t[r];switch(i){case MacroTerminator:s[n]=a,n++,a=[];break;case KeyAction.Tap:i=t[++r],a.push([RawKeycodeSequenceAction.Tap,this.byteToKey[i]]);break;case KeyAction.Down:i=t[++r],a.push([RawKeycodeSequenceAction.Down,this.byteToKey[i]]);break;case KeyAction.Up:i=t[++r],a.push([RawKeycodeSequenceAction.Up,this.byteToKey[i]]);break;default:{const c=String.fromCharCode(i);a.length&&a[a.length-1][0]===RawKeycodeSequenceAction.CharacterStream?a[a.length-1]=[RawKeycodeSequenceAction.CharacterStream,a[a.length-1][1]+c]:a.push([RawKeycodeSequenceAction.CharacterStream,c]);break}}r++}return s}rawKeycodeSequencesToMacroBytes(t){return t.flatMap(o=>{const n=[];return o.forEach(r=>{switch(r[0]){case RawKeycodeSequenceAction.Tap:n.push(KeyAction.Tap,this.basicKeyToByte[r[1]]);break;case RawKeycodeSequenceAction.Up:n.push(KeyAction.Up,this.basicKeyToByte[r[1]]);break;case RawKeycodeSequenceAction.Down:n.push(KeyAction.Down,this.basicKeyToByte[r[1]]);break;case RawKeycodeSequenceAction.Delay:break;case RawKeycodeSequenceAction.CharacterStream:n.push(...r[1].split("").map(s=>s.charCodeAt(0)));break}}),n.push(MacroTerminator),n})}async writeRawKeycodeSequences(t){const o=this.rawKeycodeSequencesToMacroBytes(t);await this.keyboardApi.setMacroBytes(o)}}function validateMacroExpressionV11(expression){let unclosedBlockRegex,keycodeBlockRegex;try{unclosedBlockRegex=eval("/(?<!\\\\){(?![^{]*})/"),keycodeBlockRegex=eval("/(?<!\\\\){(.*?)}/g")}catch(e){return console.error("Lookbehind is not supported in this browser."),{isValid:!1,errorMessage:"Lookbehind is not supported in this browser."}}if(expression.match(unclosedBlockRegex))return{isValid:!1,errorMessage:"Looks like a keycode block - {} - is unclosed! Are you missing an '}'?"};let groups=null;for(;groups=keycodeBlockRegex.exec(expression);){const e=groups[1].replace(/\s+/g,"");if(!e.length)return{isValid:!1,errorMessage:"Sorry, I can't handle empty {}. Fill them up with keycodes or use \\{} to tell the macro to literally type {}"};if(/^\d+$/.test(e)){if(/\d{5,}/.test(e))return{isValid:!1,errorMessage:`Invalid delay: ${e}. Please use a delay value of 9999 or less.`}}else{const t=e.replace(/^[-+]/,"").split(",").filter(o=>o.trim().length&&!isAutocompleteKeycode(o));if(t.length)return{isValid:!1,errorMessage:`Whoops! Invalid keycodes detected inside {}: ${t.join(", ")}`}}}return{isValid:!0,errorMessage:void 0}}class MacroAPIV11{constructor(t,o,n){this.keyboardApi=t,this.basicKeyToByte=o,this.byteToKey=n}async readRawKeycodeSequences(){const t=await this.keyboardApi.getMacroBytes(),o=await this.keyboardApi.getMacroCount();let n=0,r=0;const s=[];let a=[];if(o===0)throw Error("Macros are disabled");for(;r<t.length&&n<o;){let i=t[r];switch(i){case MacroTerminator:s[n]=a,n++,a=[];break;case KeyActionPrefix:switch(i=t[++r],i){case KeyAction.Tap:i=t[++r],a.push([RawKeycodeSequenceAction.Tap,this.byteToKey[i]]);break;case KeyAction.Down:i=t[++r],a.push([RawKeycodeSequenceAction.Down,this.byteToKey[i]]);break;case KeyAction.Up:i=t[++r],a.push([RawKeycodeSequenceAction.Up,this.byteToKey[i]]);break;case KeyAction.Delay:let c=[];for(i=t[++r];i!==DelayTerminator&&r<t.length;)c.push(i),i=t[++r];const l=c.reduce((d,u)=>(d+=String.fromCharCode(u),d),"");a.push([RawKeycodeSequenceAction.Delay,parseInt(l)]);break;default:throw`Expected a KeyAction to follow the KeyActionPrefix. Received ${i} instead.`}break;default:{const c=String.fromCharCode(i);a.length&&a[a.length-1][0]===RawKeycodeSequenceAction.CharacterStream?a[a.length-1]=[RawKeycodeSequenceAction.CharacterStream,a[a.length-1][1]+c]:a.push([RawKeycodeSequenceAction.CharacterStream,c]);break}}r++}return s}rawKeycodeSequencesToMacroBytes(t){return t.flatMap(o=>{const n=[];return o.forEach(r=>{switch(r[0]){case RawKeycodeSequenceAction.Tap:n.push(KeyActionPrefix,KeyAction.Tap,this.basicKeyToByte[r[1]]);break;case RawKeycodeSequenceAction.Down:n.push(KeyActionPrefix,KeyAction.Down,this.basicKeyToByte[r[1]]);break;case RawKeycodeSequenceAction.Up:n.push(KeyActionPrefix,KeyAction.Up,this.basicKeyToByte[r[1]]);break;case RawKeycodeSequenceAction.Delay:let s=`${r[1]}`;n.push(KeyActionPrefix,KeyAction.Delay,...s.split("").map(a=>a.charCodeAt(0)),DelayTerminator);break;case RawKeycodeSequenceAction.CharacterStream:n.push(...r[1].split("").map(a=>a.charCodeAt(0)));break}}),n.push(MacroTerminator),n})}async writeRawKeycodeSequences(t){const o=this.rawKeycodeSequencesToMacroBytes(t);await this.keyboardApi.setMacroBytes(o)}}const getMacroAPI=(e,t)=>{const o=getBasicKeyDict(e),n=getByteToKey(getBasicKeyDict(e));return e>=11?new MacroAPIV11(t,o,n):new MacroAPI(t,o,n)},getMacroValidator=e=>e>=11?validateMacroExpressionV11:validateMacroExpression,isDelaySupported=e=>e>=11,initialState$5={selectedDevicePath:null,connectedDevicePaths:{},supportedIds:{},forceAuthorize:!1},deviceSlice=createSlice({name:"devices",initialState:initialState$5,reducers:{selectDevice:(e,t)=>{t.payload?e.selectedDevicePath=t.payload.path:e.selectedDevicePath=null},setForceAuthorize:(e,t)=>{e.forceAuthorize=t.payload},updateConnectedDevices:(e,t)=>{e.connectedDevicePaths=t.payload},clearAllDevices:e=>{e.selectedDevicePath=null,e.connectedDevicePaths={}},updateSupportedIds:(e,t)=>{e.supportedIds=t.payload},ensureSupportedIds:(e,t)=>{const{productIds:o,version:n}=t.payload;o.forEach(r=>{e.supportedIds[r]=e.supportedIds[r]??{},e.supportedIds[r][n]=!0})}}}),{clearAllDevices,selectDevice,updateConnectedDevices,updateSupportedIds,ensureSupportedIds,setForceAuthorize}=deviceSlice.actions,devicesReducer=deviceSlice.reducer,getForceAuthorize=e=>e.devices.forceAuthorize,getConnectedDevices=e=>e.devices.connectedDevicePaths,getSelectedDevicePath=e=>e.devices.selectedDevicePath,getSupportedIds=e=>e.devices.supportedIds,getSelectedConnectedDevice=createSelector(getConnectedDevices,getSelectedDevicePath,(e,t)=>t&&e[t]),getSelectedKeyboardAPI=createSelector(getSelectedDevicePath,e=>e&&new KeyboardAPI(e)),macrosInitialState={ast:[],macroBufferSize:0,macroCount:0,isFeatureSupported:!0},macrosSlice=createSlice({name:"macros",initialState:macrosInitialState,reducers:{loadMacrosSuccess:(e,t)=>{e.ast=t.payload.ast,e.macroBufferSize=t.payload.macroBufferSize,e.macroCount=t.payload.macroCount},saveMacrosSuccess:(e,t)=>{e.ast=t.payload.ast},setMacrosNotSupported:e=>{e.isFeatureSupported=!1}}}),{loadMacrosSuccess,saveMacrosSuccess,setMacrosNotSupported}=macrosSlice.actions,macrosReducer=macrosSlice.reducer,loadMacros=e=>async(t,o)=>{const{protocol:n}=e;if(n<8)t(setMacrosNotSupported());else try{const r=o(),s=getSelectedKeyboardAPI(r),a=getMacroAPI(n,s);if(a){const i=await a.readRawKeycodeSequences(),c=await s.getMacroBufferSize(),l=await s.getMacroCount();t(loadMacrosSuccess({ast:i,macroBufferSize:c,macroCount:l}))}}catch{t(setMacrosNotSupported())}},saveMacros=(e,t)=>async(o,n)=>{const r=n(),s=getSelectedKeyboardAPI(r),{protocol:a}=e,i=getMacroAPI(a,s);if(i){const c=t.map(l=>{const d=expressionToSequence(l);return optimizedSequenceToRawSequence(d)});await i.writeRawKeycodeSequences(c),o(saveMacrosSuccess({ast:c}))}},getIsMacroFeatureSupported=e=>e.macros.isFeatureSupported,getAST=e=>e.macros.ast,getMacroBufferSize=e=>e.macros.macroBufferSize,getMacroCount=e=>e.macros.macroCount,getExpressions=createSelector(getAST,e=>e.map(t=>{const o=rawSequenceToOptimizedSequence(t);return sequenceToExpression(o)})),getIsDelaySupported=createSelector(getSelectedConnectedDevice,e=>!!e&&isDelaySupported(e.protocol)),maxBitSize=5,packBits=e=>e.reduce((t,[o,n])=>t<<minBitSize(n)|o,0)>>>0,numIntoBytes=e=>[e>>24,e>>16,e>>8,e].map(t=>t&255),bytesIntoNum=e=>(e[0]<<24|e[1]<<16|e[2]<<8|e[3])>>>0,unpackBits=(e,t)=>t.reverse().reduce(({res:o,bits:n},r)=>({bits:n>>minBitSize(r),res:[n&(1<<minBitSize(r))-1,...o]}),{bits:e,res:[]}).res,minBitSize=e=>1+Array(maxBitSize).fill(0).findIndex((t,o)=>2<<o>=e);function isFulfilledPromise(e){return e.status==="fulfilled"}function isAuthorizedDeviceConnected(e,t){return t&&t[e.vendorProductId]&&t[e.vendorProductId][e.requiredDefinitionVersion]}const initialState$4={definitions:{},customDefinitions:{},layoutOptionsMap:{}},definitionsSlice=createSlice({name:"definitions",initialState:initialState$4,reducers:{updateDefinitions:(e,t)=>{e.definitions={...e.definitions,...t.payload}},loadInitialCustomDefinitions:(e,t)=>{e.customDefinitions=t.payload},unloadCustomDefinition:(e,t)=>{const{version:o,id:n}=t.payload,r=e.customDefinitions[n];Object.keys(r).length===1?(delete e.customDefinitions[n],del(n)):(delete r[o],update(n,s=>(delete s[o],s))),e.customDefinitions={...e.customDefinitions}},loadCustomDefinitions:(e,t)=>{const{version:o,definitions:n}=t.payload;n.forEach(r=>{const s=e.customDefinitions[r.vendorProductId]??{};s[o]=r,e.customDefinitions[r.vendorProductId]=s})},updateLayoutOptions:(e,t)=>{e.layoutOptionsMap={...e.layoutOptionsMap,...t.payload}}}}),{loadCustomDefinitions,loadInitialCustomDefinitions,updateDefinitions,unloadCustomDefinition,updateLayoutOptions}=definitionsSlice.actions,definitionsReducer=definitionsSlice.reducer,getBaseDefinitions=e=>e.definitions.definitions,getCustomDefinitions=e=>e.definitions.customDefinitions,getLayoutOptionsMap=e=>e.definitions.layoutOptionsMap,getDefinitions=createSelector(getBaseDefinitions,getCustomDefinitions,(e,t)=>Object.entries(t).reduce((o,[n,r])=>({...o,[n]:{...o[n],...r}}),e)),getSelectedDefinition=createSelector(getDefinitions,getSelectedConnectedDevice,(e,t)=>t&&e&&e[t.vendorProductId]&&e[t.vendorProductId][t.requiredDefinitionVersion]),getBasicKeyToByte=createSelector(getSelectedConnectedDevice,e=>{const t=getBasicKeyDict(e?e.protocol:0);return{basicKeyToByte:t,byteToKey:getByteToKey(t)}}),getSelectedLayoutOptions=createSelector(getSelectedDefinition,getLayoutOptionsMap,getSelectedDevicePath,(e,t,o)=>o&&t[o]||e&&e.layouts.labels&&e.layouts.labels.map(n=>0)||[]),getSelectedOptionKeys=createSelector(getSelectedLayoutOptions,getSelectedDefinition,(e,t)=>t?e.flatMap((o,n)=>t.layouts.optionKeys[n]&&t.layouts.optionKeys[n][o]||[]):[]),getSelectedKeyDefinitions=createSelector(getSelectedDefinition,getSelectedOptionKeys,(e,t)=>e&&t?e.layouts.keys.concat(t):[]),updateLayoutOption=(e,t)=>async(o,n)=>{const r=n(),s=getSelectedDefinition(r),a=getSelectedKeyboardAPI(r),i=getSelectedDevicePath(r);if(!s||!a||!i||!s.layouts.labels)return;const c=s.layouts.labels.map(u=>Array.isArray(u)?u.slice(1).length:2),l=[...getSelectedLayoutOptions(r)];l[e]=t;const d=numIntoBytes(packBits(l.map((u,C)=>[u,c[C]])));try{await a.setKeyboardValue(KeyboardValue.LAYOUT_OPTIONS,...d)}catch{console.warn("Setting layout option command not working")}o(updateLayoutOptions({[i]:l}))},storeCustomDefinitions=({definitions:e,version:t})=>async(o,n)=>{try{const r=getCustomDefinitions(n()),s=e.map(a=>[a.vendorProductId,{...r[a.vendorProductId],[t]:a}]);return setMany(s)}catch(r){throw console.error(r),r}},loadStoredCustomDefinitions=()=>async(e,t)=>{try{const o=await entries(),n=o.filter(([a])=>["string","number"].includes(typeof a)).reduce((a,i)=>({...a,[i[0]]:i[1]}),{});e(loadInitialCustomDefinitions(n));const[r,s]=o.reduce(([a,i],[c,l])=>[l.v2?[...a,Number(c)]:a,l.v3?[...i,Number(c)]:i],[[],[]]);e(ensureSupportedIds({productIds:r,version:"v2"})),e(ensureSupportedIds({productIds:s,version:"v3"}))}catch(o){console.error(o)}},loadLayoutOptions=()=>async(e,t)=>{const o=t(),n=getSelectedDefinition(o),r=getSelectedConnectedDevice(o),s=getSelectedKeyboardAPI(o);if(!r||!n||!n.layouts.labels||!s)return;const{path:a}=r;try{const i=await s.getKeyboardValue(KeyboardValue.LAYOUT_OPTIONS,[],4),c=unpackBits(bytesIntoNum(i),n.layouts.labels.map(l=>Array.isArray(l)?l.slice(1).length:2));e(updateLayoutOptions({[a]:c}))}catch{console.warn("Getting layout options command not working")}},reloadDefinitions=e=>async(t,o)=>{const n=o(),r=getBaseDefinitions(n),s=getDefinitions(n),a=e.filter(({vendorProductId:l,requiredDefinitionVersion:d})=>!s||!s[l]||!s[l][d]),i=await Promise.allSettled(a.map(l=>getMissingDefinition(l,l.requiredDefinitionVersion)));i.forEach((l,d)=>{const u=a[d];if(l.status==="rejected"){const C=extractDeviceInfo(u);t(logAppError({message:`Fetching ${u.requiredDefinitionVersion} definition failed`,deviceInfo:C}))}});const c=i.filter(isFulfilledPromise).map(l=>l.value);c.length&&t(updateDefinitions(c.reduce((l,[d,u])=>({...l,[d.vendorProductId]:{...l[d.vendorProductId],[u]:d}}),r)))},initialState$3={rawDeviceMap:{},numberOfLayers:4,selectedLayerIndex:0,selectedKey:null,configureKeyboardIsSelectable:!1,selectedPaletteColor:[0,0]},keymapSlice=createSlice({name:"keymap",initialState:initialState$3,reducers:{setSelectedPaletteColor:(e,t)=>{e.selectedPaletteColor=t.payload},setNumberOfLayers:(e,t)=>{e.numberOfLayers=t.payload},setConfigureKeyboardIsSelectable:(e,t)=>{e.configureKeyboardIsSelectable=t.payload},loadLayerSuccess:(e,t)=>{const{layerIndex:o,keymap:n,devicePath:r}=t.payload;e.rawDeviceMap[r]=e.rawDeviceMap[r]||Array(e.numberOfLayers).fill({keymap:[],isLoaded:!1}),e.rawDeviceMap[r][o]={keymap:n,isLoaded:!0}},setLayer:(e,t)=>{e.selectedLayerIndex=t.payload},clearSelectedKey:e=>{e.selectedKey=null},updateSelectedKey:(e,t)=>{e.selectedKey=t.payload},saveKeymapSuccess:(e,t)=>{const{layers:o,devicePath:n}=t.payload;e.rawDeviceMap[n]=o},setKey:(e,t)=>{const{keymapIndex:o,value:n,devicePath:r}=t.payload,{selectedLayerIndex:s}=e;e.rawDeviceMap[r][s].keymap[o]=n}},extraReducers:e=>{e.addCase(selectDevice,t=>{t.selectedKey=null})}}),{setNumberOfLayers,setLayer,loadLayerSuccess,clearSelectedKey,setKey,updateSelectedKey,saveKeymapSuccess,setConfigureKeyboardIsSelectable,setSelectedPaletteColor}=keymapSlice.actions,keymapReducer=keymapSlice.reducer,loadKeymapFromDevice=e=>async(t,o)=>{const n=o();if(getLoadProgress(n)===1)return;const{path:r,vendorProductId:s,requiredDefinitionVersion:a}=e,i=getSelectedKeyboardAPI(n),c=await i.getLayerCount();t(setNumberOfLayers(c));const{matrix:l}=getDefinitions(n)[s][a];for(var d=0;d<c;d++){const u=await i.readRawMatrix(l,d);t(loadLayerSuccess({layerIndex:d,keymap:u,devicePath:r}))}},saveRawKeymapToDevice=(e,t)=>async(o,n)=>{const r=n(),{path:s}=t,a=getSelectedKeyboardAPI(r),i=getSelectedDefinition(r);if(!s||!i||!a)return;const{matrix:c}=i;await a.writeRawMatrix(c,e);const l=e.map(d=>({keymap:d,isLoaded:!0}));o(saveKeymapSuccess({layers:l,devicePath:s}))},updateKey=(e,t)=>async(o,n)=>{const r=n(),s=getSelectedKeyDefinitions(r),a=getSelectedConnectedDevice(r),i=getSelectedKeyboardAPI(r),c=getSelectedDefinition(r);if(!a||!s||!c||!i)return;const l=getSelectedLayerIndex(r),{path:d}=a,{row:u,col:C}=s[e];await i.setKey(l,u,C,t);const{matrix:_}=c,h=u*_.cols+C;o(setKey({keymapIndex:h,value:t,devicePath:d}))},getConfigureKeyboardIsSelectable=e=>e.keymap.configureKeyboardIsSelectable,getSelectedKey=e=>e.keymap.selectedKey,getRawDeviceMap=e=>e.keymap.rawDeviceMap,getNumberOfLayers=e=>e.keymap.numberOfLayers,getSelectedLayerIndex=e=>e.keymap.selectedLayerIndex,getSelected256PaletteColor=e=>e.keymap.selectedPaletteColor,getSelectedPaletteColor=createSelector(getSelected256PaletteColor,([e,t])=>[360*e/255,t/255]),getSelectedRawLayers=createSelector(getRawDeviceMap,getSelectedDevicePath,(e,t)=>t&&e[t]||[]),getLoadProgress=createSelector(getSelectedRawLayers,getNumberOfLayers,(e,t)=>e&&e.filter(o=>o.isLoaded).length/t);createSelector(getSelectedRawLayers,getSelectedLayerIndex,(e,t)=>e&&e[t]);const getSelectedKeymaps=createSelector(getSelectedKeyDefinitions,getSelectedDefinition,getSelectedRawLayers,(e,t,o)=>{if(t&&o){const n=o.map(s=>s.keymap),{matrix:{cols:r}}=t;return n.map(s=>e.map(({row:a,col:i})=>s[a*r+i]))}}),getSelectedKeymap=createSelector(getSelectedKeymaps,getSelectedLayerIndex,(e,t)=>e&&e[t]),commandParamLengths={[dist.LightingValue.BACKLIGHT_COLOR_1]:2,[dist.LightingValue.BACKLIGHT_COLOR_2]:2,[dist.LightingValue.QMK_RGBLIGHT_COLOR]:2,[dist.LightingValue.BACKLIGHT_CUSTOM_COLOR]:2,[dist.LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_COLOR]:2,[dist.LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_ROW_COL]:2,[dist.LightingValue.BACKLIGHT_LAYER_1_INDICATOR_COLOR]:2,[dist.LightingValue.BACKLIGHT_LAYER_2_INDICATOR_COLOR]:2,[dist.LightingValue.BACKLIGHT_LAYER_3_INDICATOR_COLOR]:2,[dist.LightingValue.BACKLIGHT_LAYER_1_INDICATOR_ROW_COL]:2,[dist.LightingValue.BACKLIGHT_LAYER_2_INDICATOR_ROW_COL]:2,[dist.LightingValue.BACKLIGHT_LAYER_3_INDICATOR_ROW_COL]:2,[dist.LightingValue.BACKLIGHT_EFFECT_SPEED]:1,[dist.LightingValue.BACKLIGHT_USE_7U_SPACEBAR]:1,[dist.LightingValue.BACKLIGHT_USE_ISO_ENTER]:1,[dist.LightingValue.BACKLIGHT_USE_SPLIT_BACKSPACE]:1,[dist.LightingValue.BACKLIGHT_USE_SPLIT_LEFT_SHIFT]:1,[dist.LightingValue.BACKLIGHT_USE_SPLIT_RIGHT_SHIFT]:1,[dist.LightingValue.BACKLIGHT_DISABLE_AFTER_TIMEOUT]:1,[dist.LightingValue.BACKLIGHT_DISABLE_HHKB_BLOCKER_LEDS]:1,[dist.LightingValue.BACKLIGHT_DISABLE_WHEN_USB_SUSPENDED]:1},initialState$2={lightingMap:{}},lightingSlice=createSlice({name:"lighting",initialState:initialState$2,reducers:{updateSelectedLightingData:(e,t)=>{const{lightingData:o,devicePath:n}=t.payload;e.lightingMap[n]=o},updateLighting:(e,t)=>{e.lightingMap={...e.lightingMap,...t.payload}}}}),{updateLighting,updateSelectedLightingData}=lightingSlice.actions,lightingReducer=lightingSlice.reducer,updateBacklightValue=(e,...t)=>async(o,n)=>{const r=n(),s=getSelectedConnectedDevice(r);if(!s)return;const i={...getSelectedLightingData(r),[e]:[...t]},{path:c}=s;o(updateSelectedLightingData({lightingData:i,devicePath:c}));const l=getSelectedKeyboardAPI(r);await l.setBacklightValue(e,...t),await l.saveLighting()},updateCustomColor=(e,t,o)=>async(n,r)=>{const s=r(),a=getSelectedConnectedDevice(s),i=getSelectedKeyboardAPI(s),c=getSelectedLightingData(s);if(!a||!c||!i)return;const l=[...c.customColors||[]];l[e]={hue:t,sat:o};const d={...c,customColors:l},{path:u}=a;n(updateSelectedLightingData({lightingData:d,devicePath:u})),i.setCustomColor(e,t,o),await i.saveLighting()},updateLightingData=e=>async(t,o)=>{const n=o(),r=getSelectedDefinition(n),s=getSelectedKeyboardAPI(n);if(!r||!s)return;const{path:a}=e;if(!dist.isVIADefinitionV2(r))throw new Error("This method is only compatible with v2 definitions");const{lighting:i}=r,{supportedLightingValues:c,effects:l}=dist.getLightingDefinition(i);if(c.length!==0){let d={};if(c.indexOf(dist.LightingValue.BACKLIGHT_CUSTOM_COLOR)!==-1){const _=await Array(Math.max(...l.map(([p,K])=>K))).fill(0).map((p,K)=>s.getCustomColor(K));d={customColors:await Promise.all(_)}}const u=c.map(_=>({command:_,promise:s.getBacklightValue(+_,commandParamLengths[_])})),C=await Promise.all(u.map(_=>_.promise));d=u.reduce(({res:_,ref:h},p,K)=>({ref:h,res:{..._,[p.command]:h[K]}}),{res:d,ref:C}).res,t(updateLighting({[a]:{...d}}))}},getLightingMap=e=>e.lighting.lightingMap,getSelectedLightingData=createSelector(getLightingMap,getSelectedDevicePath,(e,t)=>t&&e[t]);function getIconColor(e){return{style:{color:e?"var(--bg_icon-highlighted)":"var(--bg_control)"}}}const Grid=ut.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: min-content min-content minmax(0, 1fr);
  > div {
    pointer-events: all;
  }
`,Cell=ut.div`
  border-right: 1px solid var(--border_color_cell);
`,MenuCell=ut(Cell)`
  background: var(--bg_menu);
  border-top: 1px solid var(--border_color_cell);
`,OverflowCell=ut(Cell)`
  border-top: 1px solid var(--border_color_cell);
  overflow: auto;
`,SpanOverflowCell=ut(Cell)`
  border-top: 1px solid var(--border_color_cell);
  overflow: auto;
  grid-column: span 2;
`,SubmenuCell=ut(Cell)`
  border-top: 1px solid var(--border_color_cell);
  background: var(--bg_control);
`,SubmenuOverflowCell=ut(SubmenuCell)`
  min-width: 80px;
  overflow: auto;
`,SinglePaneFlexCell=ut(Cell)`
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
`,ConfigureFlexCell=ut(SinglePaneFlexCell)`
  pointer-events: none;
  height: 500px;
`,CategoryIconContainer=ut.span`
  position: relative;
  color: var(--color_inside-accent);
  height: 35px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${e=>e.$selected?"var(--color_accent)":"transparent"};
  border-radius: 10px;
  width: 40px;
  &:hover {
    color: ${e=>e.$selected?"var(--color_inside-accent)":"var(--color_accent)"};
    & .tooltip {
      transform: scale(1) translateX(0px);
      opacity: 1;
    }
  }
  .tooltip {
    transform: translateX(-5px) scale(0.6);
    opacity: 0;
  }
`,IconContainer=ut.span`
  display: inline-block;
  text-align: center;
  width: 35px;
  position: relative;
  &:hover > span > div {
    background-color: red;
  }
`,ControlRow=ut.div`
  position: relative;
  width: 100%;
  max-width: 960px;
  border-bottom: 1px solid var(--border_color_cell);
  font-size: 20px;
  justify-content: space-between;
  display: flex;
  line-height: 50px;
  min-height: 50px;
  box-sizing: border-box;
  padding-left: 5px;
  padding-right: 5px;
`,IndentedControlRow=ut(ControlRow)`
  padding-left: 17px;
`,Label$1=ut.label`
  color: var(--color_label);
  font-weight: 400;
`,SubLabel=ut(Label$1)`
  font-size: 18px;
  font-style: italic;
  font-weight: 400;
`,Detail=ut.span`
  color: var(--color_accent);
  display: flex;
  align-items: center;
`,Row=ut.div`
  cursor: pointer;
  white-space: nowrap;
  margin-bottom: 15px;
  font-size: 20px;
  line-height: 20px;
  text-transform: uppercase;
  color: ${e=>getIconColor(e.$selected).style.color};
  border-left: 2px solid transparent;

  svg {
    height: 20px;
    vertical-align: middle;
  }

  &:hover {
    color: var(--color_label-highlighted);
    & .tooltip {
      transform: scale(1) translateX(0px);
      opacity: 1;
    }
  }
  .tooltip {
    transform: translateX(-5px) scale(0.6);
    opacity: 0;
  }
`,SubmenuRow=ut(Row)`
  background: ${e=>e.$selected?"var(--bg_icon)":"inherit"};
  padding: 4px 8px;
  font-weight: 400;
  min-width: min-content;
  border-color: transparent;
  margin-bottom: 11px;
  color: ${e=>e.$selected?"var(--color_label-highlighted)":"var(--color_label)"};
  border-radius: 12px;
`,Pane$9=ut.div`
  background: var(--gradient);
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--gradient);
`,CenterPane=ut(Pane$9)`
  overflow: auto;
  display: block;
`,ConfigureBasePane=ut(Pane$9)`
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  background: transparent;
  pointer-events: none;
  z-index: 3;
`,SvgIcLightbulbOutline24Px=e=>jsx("svg",{width:11.9,height:17,...e,children:jsx("path",{d:"M3.4 16.15a.853.853 0 00.85.85h3.4a.852.852 0 00.85-.85v-.85H3.4zM5.95 0a5.947 5.947 0 00-3.4 10.829v1.921a.852.852 0 00.85.85h5.1a.852.852 0 00.85-.85v-1.921A5.947 5.947 0 005.95 0zm2.422 9.435l-.722.51V11.9h-3.4V9.945l-.722-.51a4.25 4.25 0 114.845 0z",fill:"currentColor"})}),title$4="Lighting",component$4=SvgIcLightbulbOutline24Px,AccentButtonBase=ut.button`
  height: 40px;
  padding: 0 15px;
  line-height: 40px;
  min-width: 100px;
  text-align: center;
  outline: none;
  font-size: 20px;
  border-radius: 5px;
  color: var(--color_accent);
  border: 1px solid var(--color_accent);
  display: inline-block;
  box-sizing: border-box;
  pointer-events: ${e=>e.disabled?"none":"auto"};
  cursor: ${e=>e.disabled?"not-allowed":"pointer"};

  &:hover {
    border: 1px solid var(--color_accent);
  }
`,AccentButton=ut(AccentButtonBase)`
  background-color: ${e=>e.disabled?"var(--bg_control-disabled)":"var(--bg_outside-accent)"};
  color: ${e=>e.disabled?"var(--bg_control)":"var(--color_accent)"};
  border-color: ${e=>e.disabled?"var(--bg_control)":"var(--color_accent)"};

  &:hover {
    filter: brightness(0.7);
  }
`,AccentButtonLarge=ut(AccentButton)`
  font-size: 24px;
  line-height: 60px;
  height: 60px;
`,PrimaryAccentButton=ut(AccentButtonBase)`
  color: ${e=>e.disabled?"var(--bg_control)":"var(--color_inside-accent)"};
  border-color: ${e=>e.disabled?"var(--bg_control)":"var(--color_accent)"};
  background-color: ${e=>e.disabled?"transparent":"var(--color_accent)"};
  &:hover {
    filter: brightness(0.7);
  }
`,Keycode$2=ut.span`
  color: var(--color_accent);
  display: flex;
  padding-left: 10px;
`,KeycodeLabel=ut.span`
  color: var(--color_label);
  display: flex;
`,Item=ut.div`
  box-sizing: border-box;
  min-width: 200px;
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  background-color: ${e=>e.$selected?"var(--bg_control)":"var(--bg_menu)"};

  &:hover {
    background-color: var(--bg_control);
  }
`,AutocompleteItem=({selected:e,entity:{label:t,code:o}})=>jsxs(Item,{$selected:e,children:[jsx(KeycodeLabel,{children:t})," ",jsx(Keycode$2,{children:o})]}),AutocompleteLoading=()=>jsx("div",{children:"Loading"}),findKeycodes=e=>{const t=e.toUpperCase();return getAutocompleteKeycodes().filter(({name:o,title:n,code:r})=>n?n.toUpperCase().indexOf(t)>-1:o.toUpperCase().indexOf(t)>-1||r.toUpperCase().indexOf(t)>-1).slice(0,10).map(({name:o,code:n,title:r})=>({label:r||o,code:n}))},TextInput=ut.input`
  background: none;
  border: none;
  border-bottom: 1px solid var(--color_accent);
  filter: brightness(0.7);
  color: var(--color_accent);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  transition: all 0.2s ease-out;

  &:focus {
    filter: brightness(1);
    color: var(--color_accent);
    outline: none;
  }

  &::placeholder {
    color: var(--color_control);
  }
`,ModalBackground=ut.div`
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.75);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
`,ModalContainer=ut.div`
  border: 2px solid var(--color_accent);
  min-width: 460px;
  max-width: 550px;
  min-height: 170px;
  gap: 20px;
  background-color: var(--bg_menu);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
`,PromptText=ut.div`
  font-weight: 500;
  user-select: none;
  color: var(--color_label);
  font-size: 20px;
  text-align: center;
`,RowDiv$1=ut.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 220px;
  gap: 20px;
`,AutocompleteContainer=ut.ul`
  position: fixed;
  background-color: var(--bg_menu);
  max-height: 210px;
  overflow: auto;
  border: 1px solid var(--bg_control);
  margin: 0;
  padding: 0;
  width: auto;
  margin-top: -24px;
  line-height: normal;
`,AutocompleteItemRow=ut.li`
  &:not(:last-child) {
    border-bottom: 1px solid var(--bg_control);
  }
`;function isHex(e){const t=e.toLowerCase();return`0x${parseInt(t,16).toString(16).toLowerCase()}`===t}function inputIsBasicByte(e,t){return e.trim().toUpperCase()in t}function basicByteFromInput(e,t){const o=e.trim().toUpperCase();return t[o]}function inputIsAdvancedKeyCode(e,t){const o=e.trim().toUpperCase();return advancedStringToKeycode(o,t)!==0}function advancedKeyCodeFromInput(e,t){const o=e.trim().toUpperCase();return advancedStringToKeycode(o,t)}function inputIsHex(e){return isHex(e.trim())}function hexFromInput(e){const t=e.toLowerCase();return parseInt(t,16)}function inputIsValid(e,t){return inputIsBasicByte(e,t)||inputIsAdvancedKeyCode(e,t)||inputIsHex(e)}function keycodeFromInput(e,t){return inputIsBasicByte(e,t)?basicByteFromInput(e,t):inputIsAdvancedKeyCode(e,t)?advancedKeyCodeFromInput(e,t):inputIsHex(e)?hexFromInput(e):null}const getInputItems=e=>e.map(t=>({code:t.code,label:t.title??t.name})),KeycodeModal=e=>{const t=useAppSelector(getSelectedDefinition),{basicKeyToByte:o,byteToKey:n}=useAppSelector(getBasicKeyToByte);if(!t)return null;const r=getInputItems(getKeycodesForKeyboard(t)),[s,a]=reactExports.useState(r),i=anyKeycodeToString(e.defaultValue,o,n),{getMenuProps:c,getInputProps:l,highlightedIndex:d,inputValue:u,getItemProps:C,isOpen:_}=useCombobox({items:s,initialIsOpen:i==="",defaultInputValue:i,itemToString:p=>(p==null?void 0:p.code)??"",onInputValueChange:({inputValue:p})=>{a(r.filter(({label:K,code:g})=>[K,g].flatMap(y=>y.split(/\s+/)).map(y=>y.toLowerCase()).some(y=>y.startsWith((p??"").toLowerCase()))))}}),h=inputIsValid(u,o);return jsx(ModalBackground,{children:jsxs(ModalContainer,{children:[jsx(PromptText,{children:"Please enter your desired QMK keycode or hex code:"}),jsxs("div",{children:[jsx("div",{children:jsx(TextInput,{...l(),type:"text",placeholder:i||"KC_NO, 0xFF, etc."})}),jsx(AutocompleteContainer,{...c(),style:{display:_&&s.length?"block":"none"},children:_&&s.map((p,K)=>reactExports.createElement(AutocompleteItemRow,{...C({item:p,index:K}),key:p.code},jsx(AutocompleteItem,{selected:d===K,entity:p},p.code)))})]}),jsxs(RowDiv$1,{children:[jsx(AccentButton,{onClick:e.onExit,children:"Cancel"}),jsx(PrimaryAccentButton,{disabled:!h,onClick:()=>{e.onConfirm(keycodeFromInput(u,o))},children:"Confirm"})]})]})})},PelpiKeycodeInput=e=>{const[t,o]=React.useState(!1),{basicKeyToByte:n,byteToKey:r}=useAppSelector(getBasicKeyToByte);return jsxs(Fragment,{children:[jsx(AccentButton,{onClick:()=>o(!0),children:anyKeycodeToString(e.value,n,r)}),t&&jsx(KeycodeModal,{defaultValue:e.value,onChange:e.setValue,onConfirm:s=>{e.setValue(s),o(!1)},onExit:()=>o(!1)})]})},HiddenInput=ut.input`
  opacity: 0;
  width: 0;
  height: 0;
`,Switch=ut.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`,Slider=ut.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${e=>e.$ischecked?"var(--color_accent)":"var(--bg_control)"};
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 4px;
  &:before {
    position: absolute;
    content: '';
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    border-radius: 4px;
    background-color: ${e=>e.$ischecked?"var(--color_inside-accent)":"var(--bg_icon)"};
    -webkit-transition: 0.4s;
    transition: 0.4s;
    ${e=>e.$ischecked?"transform: translateX(26px)":""};
  }
`;function AccentSlider(e){const{isChecked:t,onChange:o}=e,[n,r]=React.useState(t),s=reactExports.useRef(null);return React.useEffect(()=>{r(t)},[t]),jsxs(Switch,{children:[jsx(HiddenInput,{ref:s,type:"checkbox",checked:n,onChange:()=>{const i=!t;r(i),o(i),s.current&&s.current.blur()}}),jsx(Slider,{$ischecked:n})]})}const customStyles={option:(e,t)=>({...e,"&:hover":{backgroundColor:t.isSelected?"var(--color_accent)":"var(--bg_control)"},":active":{backgroundColor:"var(--bg_control)"},background:t.isSelected?"var(--color_accent)":t.isFocused?"var(--bg_control)":"var(--bg_menu)",color:t.isSelected?"var(--color_inside-accent)":(t.isFocused,"var(--color_accent)")}),container:e=>({...e,lineHeight:"initial",flex:1}),input:e=>({...e,color:"var(--color_accent)",opacity:.5}),singleValue:e=>({...e,color:"var(--color_accent)"}),dropdownIndicator:e=>({...e,color:"var(--color_accent)"}),indicatorSeparator:e=>({...e,backgroundColor:"var(--color_accent)"}),menuList:e=>({...e,borderColor:"var(--color_accent)",backgroundColor:"var(--bg_menu)"}),placeholder:e=>({...e,color:"var(--color_accent)"}),valueContainer:e=>({...e,":active":{backgroundColor:"var(--bg_control)",borderColor:"var(--color_accent)"},"&:hover":{borderColor:"var(--color_accent)"},color:"var(--color_accent)",background:"var(--bg_menu)"}),control:(e,t)=>({...e,boxShadow:"none",":active":{backgroundColor:"transparent",borderColor:"var(--color_accent)"},"&:hover":{borderColor:"var(--color_accent)"},color:"var(--color_accent)",borderColor:"1px solid var(--color_accent)",background:"var(--bg_menu)",overflow:"hidden",width:t.selectProps.width||250})},AccentSelect=e=>jsx(StateManagedSelect$1,{...e,styles:customStyles}),Container$f=ut.span`
  display: inline-block;
  line-height: initial;
  width: 200px;
`,SliderInput=ut.input.attrs({type:"range"})`
  accent-color: var(--color_accent);
  width: 100%;
`,AccentRange=e=>jsx(Container$f,{children:jsx(SliderInput,{...e,onChange:t=>{e.onChange&&e.onChange(+t.target.value)}})}),ColorPickerContainer=ut.div`
  display: flex;
  align-items: center;
`,ColorLens=ut.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid black;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  box-sizing: border-box;
  transform: translate3d(195px, 195px, 0);
`,ColorInner=ut.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, white, rgba(0, 0, 0, 0));
`,ColorOuter=ut.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    red,
    yellow,
    lime,
    aqua,
    blue,
    magenta,
    red
  );
`,ColorThumbnail=ut.div`
  display: inline-block;
  height: 25px;
  width: 25px;
  border-radius: 50%;
  border: 4px solid var(--border_color_cell);
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`,Container$e=ut.div`
  border: 4px solid var(--border_color_cell);
  width: 180px;
  height: 180px;
  position: relative;
`,PickerContainer=ut.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1;
  box-shadow: rgba(0, 0, 0, 0.11) 0 1px 1px 1px;
  position: absolute;
  transform: translate3d(-205px, 50px, 0);

  &::after {
    content: '';
    position: absolute;
    width: 0px;
    height: 0px;
    border: 11px solid var(--border_color_cell);
    border-top-color: transparent;
    border-bottom-color: transparent;
    border-right-color: transparent;
    right: -22px;
    top: 66px;
  }
`,ColorPreview=ut.div`
  width: 180px;
  height: 24px;
  border: 4px solid var(--border_color_cell);
  border-bottom: none;
`,ColorHexContainer=ut.div`
  border: 4px solid var(--border_color_cell);
  border-bottom: none;
  width: 180px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: var(--bg_menu);
`,ColorHexInput=ut.input`
  text-align: center;
  border: none;
  color: var(--color_accent);
  background: var(--bg_menu);
  font-size: 20px;
  font-weight: 300;
  padding: 0;
  width: 100%;
  &:focus {
    outline: none;
    color: var(--color_accent);
    border-color: var(--color_accent);
  }
`;class ColorPicker extends reactExports.Component{constructor(){super(...arguments);x(this,"ref",null);x(this,"refWidth",0);x(this,"refHeight",0);x(this,"mouseDown",!1);x(this,"state",{lensTransform:"",showPicker:!1,offset:[5,5],hexColorCode:getHex(this.props.color)});x(this,"onMouseMove",o=>{if(this.mouseDown){const{offsetX:n,offsetY:r}=o.nativeEvent,s=`translate3d(${n-5}px, ${r-5}px, 0)`,a=[n,r],{hue:i,sat:c}=this.getLinearHueSat(a),l=getHex(this.props.color);this.props.setColor(Math.round(255*(i/360)),Math.round(255*c)),this.setState({lensTransform:s,offset:a,hexColorCode:l})}});x(this,"onMouseDown",o=>{this.mouseDown=!0,this.onMouseMove(o),this.ref&&(this.ref.style.cursor="pointer")});x(this,"onMouseUp",()=>{if(this.mouseDown=!1,this.ref&&(this.ref.style.cursor="auto"),this.props.onMouseUp){const{hue:o,sat:n}=this.getLinearHueSat(this.state.offset);this.props.onMouseUp(o,n)}});x(this,"onThumbnailClick",()=>{this.props.onOpen&&this.props.onOpen(),this.setState({showPicker:!0})});x(this,"pickerContainer",React.createRef());x(this,"colorThumbnail",React.createRef());x(this,"onDocumentClick",o=>{if(this.state.showPicker&&this.pickerContainer.current&&!this.pickerContainer.current.contains(o.target)&&this.colorThumbnail.current&&!this.colorThumbnail.current.contains(o.target)&&!this.mouseDown){if(this.props.onClose){const{hue:n,sat:r}=this.getLinearHueSat(this.state.offset);this.props.onClose(n,r)}this.mouseDown=!1,this.setState({showPicker:!1,hexColorCode:getHex(this.props.color)})}else this.mouseDown&&this.state.showPicker&&this.pickerContainer.current&&!this.pickerContainer.current.contains(o.target)&&this.colorThumbnail.current&&!this.colorThumbnail.current.contains(o.target)&&this.onMouseUp()});x(this,"handleHexChange",o=>{let n=o.target.value;n=n.replace(/[^A-Fa-f0-9]/g,""),n.length>0&&n[0]!=="#"&&(n=`#${n}`),n.length>7&&(n=n.substring(0,7)),this.setState({hexColorCode:n})});x(this,"handleHexBlur",o=>{this.setState({hexColorCode:getHex(this.props.color)})});x(this,"handleHexSubmit",o=>{if(o.key==="Enter"){if(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(this.state.hexColorCode)){var n=this.state.hexColorCode.replace("#","");n.length==3&&(n=`${n.split("").map(i=>i+i).join("")}`);const[s,a]=getHSV(n);this.props.setColor(Math.round(255*(s/360)),Math.round(255*a))}this.setState({hexColorCode:getHex(this.props.color)})}})}componentWillUnmount(){document.removeEventListener("mousedown",this.onDocumentClick),document.removeEventListener("click",this.onDocumentClick)}componentDidUpdate({color:o},n){if(this.ref&&this.state.showPicker&&(!n.showPicker||o!==this.props.color)){const{width:r,height:s}=this.ref.getBoundingClientRect();this.refWidth=r,this.refHeight=s;const{hue:a,sat:i}=this.props.color,c=r*a/255,l=s*(1-i/255),d=`translate3d(${c-5}px, ${l-5}px, 0)`;this.setState({lensTransform:d,offset:[c,l]})}}componentDidMount(){document.addEventListener("click",this.onDocumentClick),document.addEventListener("mousedown",this.onDocumentClick)}getRadialHueSat(o){const{offsetX:n,offsetY:r}=o.nativeEvent,s=toDegrees(calcRadialHue(n,r)??0),a=Math.min(1,calcRadialMagnitude(n,r)??0);return{hue:s,sat:a}}getLinearHueSat([o,n]){const r=this.refWidth,s=this.refHeight,[a,i]=[Math.max(0,o),Math.max(0,n)],c=360*Math.min(1,a/r),l=1-Math.min(1,i/s);return{hue:c,sat:l}}render(){const o=getRGB(this.props.color),{isSelected:n=!1}=this.props,{offset:r}=this.state,s=`translate3d(${r[0]-5}px, ${r[1]-5}px, 0)`;return jsx(Fragment,{children:jsxs(ColorPickerContainer,{children:[jsx(ColorThumbnail,{ref:this.colorThumbnail,onClick:this.onThumbnailClick,style:{background:o,borderColor:n?"var(--color_accent)":"var(--border_color_cell)"}}),this.state.showPicker&&jsxs(PickerContainer,{ref:this.pickerContainer,onMouseUp:this.onMouseUp,children:[jsx(ColorHexContainer,{children:jsx(ColorHexInput,{type:"text",value:this.state.hexColorCode,onChange:this.handleHexChange,onBlur:this.handleHexBlur,onKeyDown:this.handleHexSubmit})}),jsx(ColorPreview,{style:{background:getRGB(this.props.color)}}),jsx(Container$e,{children:jsx(ColorOuter,{onMouseDown:this.onMouseDown,onMouseMove:this.onMouseMove,ref:a=>this.ref=a,children:jsx(ColorInner,{children:jsx(ColorLens,{style:{transform:s}})})})})]})]})})}}const ArrayColorPicker=e=>{const{color:t,setColor:o}=e;return jsx(ColorPicker,{color:{hue:t[0],sat:t[1]},setColor:o})},ColorPalettePickerContainer=ut.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
`,PreviousColorContainer=ut.div`
  display: flex;
  background: var(--bg_control);
  border-radius: 15px;
`,PreviousColorOption=ut.div`
  display: inline-block;
  height: 25px;
  width: 25px;
  border-radius: 50%;
  border: 4px solid var(--border_color_cell);
  cursor: pointer;
  transition: transform 0.2s ease-out;
  &:hover {
    opacity: 0.8;
  }
  transform: ${e=>e.$selected?"scale(0.8)":"scale(0.6)"};
  border-color: ${e=>e.$selected?"var(--color_accent)":"var(--border_color_cell)"};
`,ConnectedColorPalettePicker=()=>{const e=useDispatch(),t=reactExports.useCallback((o,n)=>e(setSelectedPaletteColor([o,n])),[e]);return reactExports.useEffect(()=>(e(updateShowKeyPainter(!0)),()=>{e(updateShowKeyPainter(!1))})),jsx(ColorPalettePicker,{color:[0,0],setColor:t})},ColorPalettePicker=e=>{const{color:t,setColor:o}=e,[n,r]=reactExports.useState(t),[s,a]=reactExports.useState(t),i=reactExports.useMemo(()=>Array(9).fill(0).map((c,l)=>[Math.round(l*255/10),255,255]),[]);return jsxs(ColorPalettePickerContainer,{children:[jsx(PreviousColorContainer,{children:i.map((c,l)=>{const d=n[0]===c[0]&&n[1]===c[1];return jsx(PreviousColorOption,{$selected:d,style:{background:getRGB({hue:c[0]??0,sat:c[1]??0})},onClick:()=>{r(c),o(c[0],c[1])}},l)})}),jsx(ColorPicker,{isSelected:s[0]===n[0]&&s[1]===n[1],color:{hue:s[0],sat:s[1]},setColor:(c,l)=>{r([c,l]),a([c,l])},onOpen:()=>{r([s[0],s[1]]),o(s[0],s[1])},onMouseUp:()=>{r([s[0],s[1]]),o(s[0],s[1])}})]})},VIACustomItem=React.memo(e=>jsxs(ControlRow,{id:e._id,children:[jsx(Label$1,{children:e.label}),jsx(Detail,{children:"type"in e?jsx(VIACustomControl,{...e,value:e.value&&Array.from(e.value)}):e.content})]})),boxOrArr=e=>Array.isArray(e)?e:[e],valueIsChecked=(e,t)=>boxOrArr(e).every((o,n)=>o==t[n]),getRangeValue=(e,t)=>t>255?shiftTo16Bit([e[0],e[1]]):e[0],getRangeBytes=(e,t)=>t>255?shiftFrom16Bit(e):[e],VIACustomControl=e=>{const{content:t,type:o,options:n,value:r}=e,[s,...a]=t;switch(o){case"button":{const i=n||[1];return jsx(AccentButton,{onClick:()=>e.updateValue(s,...a,i[0]),children:"Click"})}case"range":return jsx(AccentRange,{min:n[0],max:n[1],defaultValue:getRangeValue(e.value,n[1]),onChange:i=>e.updateValue(s,...a,...getRangeBytes(i,n[1]))});case"keycode":return jsx(PelpiKeycodeInput,{value:shiftTo16Bit([e.value[0],e.value[1]]),meta:{},setValue:i=>e.updateValue(s,...a,...shiftFrom16Bit(i))});case"toggle":{const i=n||[0,1];return jsx(AccentSlider,{isChecked:valueIsChecked(i[1],e.value),onChange:c=>e.updateValue(s,...a,...boxOrArr(i[+c]))})}case"dropdown":{const i=n.map((c,l)=>{const[d,u]=typeof c=="string"?[c,l]:c;return{value:u||l,label:d}});return jsx(AccentSelect,{onChange:c=>c&&e.updateValue(s,...a,+c.value),options:i,defaultValue:i.find(c=>r[0]===c.value)})}case"color":return jsx(ArrayColorPicker,{color:e.value,setColor:(i,c)=>e.updateValue(s,...a,i,c)});case"color-palette":return jsx(ConnectedColorPalettePicker,{})}return null},CustomPane=ut(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`,Container$d=ut.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;function categoryGenerator(e){return e.viaMenu.content.flatMap(t=>submenuGenerator(t,e))}function itemGenerator(e,t){return"showIf"in e&&!dist$1.evalExpr(e.showIf,t.selectedCustomMenuData)?[]:"label"in e?{...e,key:e._id}:e.content.flatMap(o=>itemGenerator(o,t))}const MenuComponent=React.memo(e=>jsx(Fragment,{children:e.elem.content.flatMap(t=>itemGenerator(t,e)).map(t=>jsx(VIACustomItem,{...t,updateValue:e.updateCustomMenuValue,value:e.selectedCustomMenuData[t.content[0]]}))})),MenuBuilder=e=>t=>reactExports.createElement(MenuComponent,{...t,key:e._id,elem:e});function submenuGenerator(e,t){return"showIf"in e&&!dist$1.evalExpr(e.showIf,t.selectedCustomMenuData)?[]:"label"in e?{label:e.label,Menu:MenuBuilder(e)}:e.content.flatMap(o=>submenuGenerator(o,t))}const Pane$8=e=>{const t=useAppDispatch(),o=categoryGenerator(e),[n,r]=reactExports.useState(o[0]||{label:"",Menu:()=>jsx("div",{})}),s=n.Menu,a=useAppSelector(getSelectedDefinition),i=useAppSelector(getSelectedCustomMenuData),c={...e,selectedDefinition:a,selectedCustomMenuData:i,updateCustomMenuValue:(l,...d)=>t(updateCustomMenuValue(l,...d))};return!a||!i?null:jsxs(Fragment,{children:[jsx(SubmenuCell,{children:jsx(MenuContainer$5,{children:o.map(l=>jsx(SubmenuRow,{$selected:n.label===l.label,onClick:()=>r(l),children:l.label},l.label))})}),jsx(OverflowCell,{children:jsx(CustomPane,{children:jsx(Container$d,{children:s(c)})})})]})},MenuContainer$5=ut.div`
  padding: 15px 10px 20px 10px;
`,iconKeywords=[{icon:faLightbulb,keywords:["light","rgb"]},{icon:faHeadphones,keywords:["audio","sound"]},{icon:faDisplay,keywords:["display","oled","lcd"]}],getIconFromLabel=e=>{const t=e.label.toLowerCase(),o={icon:faMicrochip};return(iconKeywords.find(n=>n.keywords.some(r=>t.includes(r)))||o).icon},makeCustomMenu=(e,t)=>({Title:e.label,Icon:()=>jsx(FontAwesomeIcon,{icon:getIconFromLabel(e)}),Pane:o=>reactExports.createElement(Pane$8,{...o,key:`${e.label}-${t}`,viaMenu:e})}),makeCustomMenus=e=>e.map(makeCustomMenu),initialState$1={customMenuDataMap:{},commonMenusMap:{},showKeyPainter:!1},menusSlice=createSlice({name:"menus",initialState:initialState$1,reducers:{updateShowKeyPainter:(e,t)=>{e.showKeyPainter=t.payload},updateSelectedCustomMenuData:(e,t)=>{const{devicePath:o,menuData:n}=t.payload;e.customMenuDataMap[o]=n},updateCommonMenus:(e,t)=>{const{commonMenuMap:o}=t.payload;e.commonMenusMap=o},updateCustomMenuData:(e,t)=>{e.customMenuDataMap={...e.customMenuDataMap,...t.payload}}}}),{updateShowKeyPainter,updateSelectedCustomMenuData,updateCustomMenuData}=menusSlice.actions,menusReducer=menusSlice.reducer,updateCustomMenuValue=(e,...t)=>async(o,n)=>{const r=n(),s=getSelectedConnectedDevice(r);if(!s)return;const a=getSelectedCustomMenuData(r),i=getCustomCommands(r),c={...a,[e]:[...t.slice(i[e].length)]},{path:l}=s;o(updateSelectedCustomMenuData({menuData:c,devicePath:l}));const d=getSelectedKeyboardAPI(r);d.setCustomMenuValue(...t.slice(0));const u=t[0];d.commitCustomMenu(u)},tryResolveCommonMenu=e=>typeof e=="string"?dist.commonMenus[e]:e,updateV3MenuData=e=>async(t,o)=>{const n=o(),r=getSelectedDefinition(n),s=getSelectedKeyboardAPI(n);if(!dist.isVIADefinitionV3(r))throw new Error("V3 menus are only compatible with V3 VIA definitions.");const i=getV3Menus(n).flatMap(extractCommands),{protocol:c,path:l}=e;if(i.length!==0&&c>=11){let d={};const u=i.map(([h,p,...K])=>({command:h,promise:s.getCustomMenuValue([p].concat(K))})),C=await Promise.all(u.map(h=>h.promise));d=u.reduce(({res:h,ref:p},K,g)=>({ref:p,res:{...h,[K.command]:p[g].slice(1)}}),{res:d,ref:C}).res;const _=Math.max(...r.layouts.keys.map(h=>h.li??-1));if(console.debug(_,"maxLedIndex"),_>=0){const h=await s.getPerKeyRGBMatrix(Array(_+1).fill(0).map((p,K)=>K));d.__perKeyRGB=h}t(updateSelectedCustomMenuData({devicePath:l,menuData:{...d}}))}},extractCommands=e=>typeof e=="string"?[]:"type"in e?[e.content]:"content"in e&&typeof e.content!="string"?e.content.flatMap(extractCommands):[],getShowKeyPainter=e=>e.menus.showKeyPainter,getCustomMenuDataMap=e=>e.menus.customMenuDataMap,getSelectedCustomMenuData=createSelector(getCustomMenuDataMap,getSelectedDevicePath,(e,t)=>t&&e[t]),getV3Menus=createSelector(getSelectedDefinition,e=>!e||!dist.isVIADefinitionV3(e)?[]:(e.menus||[]).flatMap(tryResolveCommonMenu).map((t,o)=>dist.isVIAMenu(t)?compileMenu("custom_menu",3,t,o):t)),getV3MenuComponents=createSelector(getSelectedDefinition,e=>!e||!dist.isVIADefinitionV3(e)?[]:(e.menus||[]).flatMap(tryResolveCommonMenu).map((t,o)=>dist.isVIAMenu(t)?makeCustomMenu(compileMenu("custom_menu",3,t,o),o):t)),getCustomCommands=createSelector(getSelectedDefinition,getV3Menus,(e,t)=>{if(!e)return[];const o=dist.isVIADefinitionV2(e)?e.customMenus:t;return o===void 0?[]:o.flatMap(extractCommands).reduce((n,r)=>({...n,[r[0]]:r.slice(1)}),{})}),compileMenu=(e,t=0,o,n)=>t===0?o:{...o,_id:`${e}_${n}`,content:o.label!==void 0?typeof o.content=="string"?o.content:o.content.map((r,s)=>compileMenu(`${e}_${s}`,t-1,r,n)):o.content.map((r,s)=>compileMenu(`${e}_${s}`,t,r,n))},initialState={showMatrix:!1,selectedOptionKeys:[],selectedDefinitionIndex:0},designSlice=createSlice({name:"design",initialState,reducers:{updateSelectedDefinitionIndex:(e,t)=>{e.selectedDefinitionIndex=t.payload},updateSelectedOptionKeys:(e,t)=>{e.selectedOptionKeys=t.payload},updateShowMatrix:(e,t)=>{e.showMatrix=t.payload}}}),{updateSelectedDefinitionIndex,updateSelectedOptionKeys,updateShowMatrix}=designSlice.actions,designReducer=designSlice.reducer,getSelectedDefinitionIndex=e=>e.design.selectedDefinitionIndex,getDesignSelectedOptionKeys=e=>e.design.selectedOptionKeys,getShowMatrix=e=>e.design.showMatrix,formatNumberAsHex=(e,t)=>`0x${e.toString(16).padStart(t,"0").toUpperCase()}`,errorsListenerMiddleware=createListenerMiddleware(),captureError=(e,t)=>{captureException(new Error(e),{tags:{productName:t.productName,vendorId:formatNumberAsHex(t.vendorId,4),protocol:t.protocol},extra:{deviceInfo:t}})};errorsListenerMiddleware.startListening({actionCreator:logAppError,effect:async({payload:{message:e,deviceInfo:t}},o)=>{captureError(e,t)}});errorsListenerMiddleware.startListening({actionCreator:logKeyboardAPIError,effect:async({payload:e},t)=>{captureError(extractMessageFromKeyboardAPIError(e),e.deviceInfo)}});const sentryEnhancer=createReduxEnhancer({}),store=configureStore({reducer:{settings:settingsReducer,macros:macrosReducer,devices:devicesReducer,keymap:keymapReducer,definitions:definitionsReducer,lighting:lightingReducer,menus:menusReducer,design:designReducer,errors:errorsReducer},enhancers:[sentryEnhancer],middleware:e=>e().prepend(errorsListenerMiddleware.middleware)}),imgSrc="/assets/chippy_600-902171c5.png",defaultChippy={width:300,height:300,src:imgSrc},LoaderContainer=ut.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`,CircleContainer=ut.div`
  border-radius: 50%;
  background-color: var(--bg_icon);
  height: ${e=>e.$containerHeight}px;
  width: ${e=>e.$containerWidth}px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;

  animation-duration: 1.5s;
  animation-name: roll;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;

  &::after {
    height: ${e=>e.$containerHeight}px;
    width: ${e=>e.$containerWidth}px;
    position: absolute;
    content: '';
    background-color: ${e=>e.$progressColor};
    top: ${e=>e.$containerHeight+1}px;
    left: 0;
    right: 0;
    transition: transform 0.4s ease-out;
    transform: translate3d(
      0,
      ${e=>-(e.$progress||0)*e.$containerHeight}px,
      0
    );
  }
`,SvgComponent=e=>{const{theme:t}=e,o=getDarkenedColor(t.accent.c,.8),n={"upper-body":t.mod.t,"lower-body":t.mod.c,accent:o,bowtie:o,pins:o,feet:"#000"};return jsxs("svg",{id:"Layer_1",xmlns:"http://www.w3.org/2000/svg",x:0,y:0,viewBox:"0 0 600 600",style:{enableBackground:"new 0 0 600 600"},xmlSpace:"preserve",...e,children:[jsx("style",{children:`.st3{fill:#fdfefe}.st4{fill:${n.bowtie}}.st5{fill-rule:evenodd;clip-rule:evenodd;fill:${n.accent}}.st7,.st9{fill-rule:evenodd;clip-rule:evenodd}.st10,.st9{fill:#fff}`}),jsxs("g",{id:"Layer_2_00000088814685506851870240000015950599998114990989_",children:[jsx("g",{id:"Feet",children:jsx("path",{d:"M169.7 432.1c28.3 0 51.5 23.3 51.5 51.5s-23.3 51.5-51.5 51.5-51.5-23.3-51.5-51.5 23.2-51.5 51.5-51.5zM425.8 432.1c28.3 0 51.5 23.3 51.5 51.5s-23.3 51.5-51.5 51.5-51.5-23.3-51.5-51.5 23.2-51.5 51.5-51.5z"})}),jsxs("g",{id:"Body",children:[jsx("path",{d:"M26.7 66.8h546.2c9.8 0 17.7 7.9 17.7 17.7v273.3H9V84.6c0-9.8 7.9-17.8 17.7-17.8z",style:{fill:n["upper-body"]}}),jsx("path",{d:"M9 357.4h581.6v113.7c0 8.4-6.9 15.3-15.3 15.3h-551c-8.4 0-15.3-6.9-15.3-15.3V357.4z",style:{fill:n["lower-body"]}})]}),jsx("path",{d:"M229.4 262.8s33.5 19.4 66.3 19.4c33.5 0 66.3-19.4 66.3-19.4",style:{fill:"none",stroke:"#000",strokeWidth:6.8265,strokeLinecap:"round",strokeLinejoin:"round",strokeMiterlimit:2.0408},id:"Smile"}),jsxs("g",{id:"Eyes",children:[jsx("path",{d:"M417.1 132.4c26.5 0 48 26.4 48 59.1s-21.4 59.1-48 59.1-48-26.4-48-59.1 21.5-59.1 48-59.1zM175.3 132.4c26.5 0 48 26.4 48 59.1s-21.4 59.1-48 59.1-48-26.4-48-59.1 21.5-59.1 48-59.1z"}),jsx("path",{className:"st3",d:"M422.7 210.7c4.2 0 7.7 3.5 7.7 7.7s-3.5 7.7-7.7 7.7-7.7-3.5-7.7-7.7 3.5-7.7 7.7-7.7zM418.2 159.7c9.5 0 17.3 7.8 17.3 17.3s-7.8 17.3-17.3 17.3-17.3-7.8-17.3-17.3c-.1-9.5 7.7-17.3 17.3-17.3zM179.9 210.7c4.2 0 7.7 3.5 7.7 7.7s-3.5 7.7-7.7 7.7-7.7-3.5-7.7-7.7 3.5-7.7 7.7-7.7zM175.3 159.7c9.5 0 17.3 7.8 17.3 17.3s-7.8 17.3-17.3 17.3S158 186.5 158 177c-.1-9.5 7.8-17.3 17.3-17.3z"})]}),jsx("g",{id:"Pins",children:jsx("path",{className:"st4",d:"M12.6 276h17.5c5.8 0 10.5 6.9 10.5 15.3V324c0 8.4-4.7 15.3-10.5 15.3H12.6C6.7 339.3 2 332.4 2 324v-32.7c0-8.4 4.7-15.3 10.6-15.3zM12.6 190.3h17.5c5.8 0 10.5 6.9 10.5 15.3v32.7c0 8.4-4.7 15.3-10.5 15.3H12.6c-5.8 0-10.5-6.9-10.5-15.3v-32.7c-.1-8.4 4.6-15.3 10.5-15.3zM12.6 102.6h17.5c5.8 0 10.5 6.9 10.5 15.3v32.7c0 8.4-4.7 15.3-10.5 15.3H12.6C6.7 165.8 2 159 2 150.5v-32.7c0-8.4 4.7-15.2 10.6-15.2zM569.6 276h17.5c5.8 0 10.5 6.9 10.5 15.3V324c0 8.4-4.7 15.3-10.5 15.3h-17.5c-5.8 0-10.5-6.9-10.5-15.3v-32.7c0-8.4 4.7-15.3 10.5-15.3zM569.6 190.3h17.5c5.8 0 10.5 6.9 10.5 15.3v32.7c0 8.4-4.7 15.3-10.5 15.3h-17.5c-5.8 0-10.5-6.9-10.5-15.3v-32.7c0-8.4 4.7-15.3 10.5-15.3zM569.6 102.6h17.5c5.8 0 10.5 6.9 10.5 15.3v32.7c0 8.4-4.7 15.3-10.5 15.3h-17.5c-5.8 0-10.5-6.9-10.5-15.3v-32.7c0-8.5 4.7-15.3 10.5-15.3z"})}),jsx("g",{id:"Cheeks",children:jsxs("g",{id:"Layer_8",children:[jsx("ellipse",{transform:"rotate(120 89.724 277.697)",className:"st5",cx:68.5,cy:243.9,rx:12.9,ry:29.3}),jsx("ellipse",{transform:"rotate(150 447.814 278.705)",className:"st5",cx:430.5,cy:271.6,rx:29.3,ry:12.9})]})}),jsx("g",{id:"Bowties",children:jsx("path",{className:"st4",d:"m293.7 356.6 73.5-33.7v67.3l-73.5-33.6zM293.7 356.6l-73.5 33.7V323l73.5 33.6z"})})]}),jsxs("g",{id:"Layer2",style:{opacity:.15},children:[jsx("path",{className:"st7",d:"M6.7 105.2c2.5-2.6 5.8-2.5 5.8-2.5v63.2s-3.9.4-7.1-4c-.7-.7-3.4-5.1-3.4-11.3v-32.4c0-7 2.7-11 4.7-13z"}),jsx("path",{d:"M112.4 486.3H24c-13 0-14.8-14.5-14.8-14.5S9 332.7 9 353.4c0 20.8 79.5 132.9 103.4 132.9z",style:{fillRule:"evenodd",clipRule:"evenodd",fill:"#180000"}}),jsx("path",{className:"st9",d:"M35.9 105.1c-2.5-2.6-5.8-2.5-5.8-2.5v63.2s3.9.4 7.1-4c.7-.7 3.4-5.1 3.4-11.3v-32.4c0-7-2.8-11-4.7-13z"}),jsx("path",{className:"st7",d:"M6.7 192.9c2.5-2.6 5.8-2.5 5.8-2.5v63.2s-3.9.4-7.1-4c-.7-.7-3.4-5.1-3.4-11.3v-32.4c0-7 2.7-11 4.7-13z"}),jsx("path",{className:"st9",d:"M35.9 192.8c-2.5-2.6-5.8-2.5-5.8-2.5v63.2s3.9.4 7.1-4c.7-.7 3.4-5.1 3.4-11.3v-32.4c0-7-2.8-11-4.7-13z"}),jsx("path",{className:"st7",d:"M6.7 278.6c2.5-2.6 5.8-2.5 5.8-2.5v63.2s-3.9.4-7.1-4c-.7-.7-3.4-5.1-3.4-11.3v-32.4c0-6.9 2.7-10.9 4.7-13z"}),jsx("path",{className:"st9",d:"M35.9 278.5c-2.5-2.6-5.8-2.5-5.8-2.5v63.2s3.9.4 7.1-4c.7-.7 3.4-5.1 3.4-11.3v-32.4c0-7-2.8-11-4.7-13z"}),jsx("path",{className:"st7",d:"M563.7 105.2c2.5-2.6 5.8-2.5 5.8-2.5v63.2s-3.9.4-7.1-4c-.7-.7-3.4-5.1-3.4-11.3v-32.4c0-7 2.7-11 4.7-13z"}),jsx("path",{className:"st9",d:"M592.9 105.1c-2.5-2.6-5.8-2.5-5.8-2.5v63.2s3.9.4 7.1-4c.7-.7 3.4-5.1 3.4-11.3v-32.4c0-7-2.7-11-4.7-13z"}),jsx("path",{className:"st7",d:"M563.7 192.9c2.5-2.6 5.8-2.5 5.8-2.5v63.2s-3.9.4-7.1-4c-.7-.7-3.4-5.1-3.4-11.3v-32.4c0-7 2.7-11 4.7-13z"}),jsx("path",{className:"st9",d:"M592.9 192.8c-2.5-2.6-5.8-2.5-5.8-2.5v63.2s3.9.4 7.1-4c.7-.7 3.4-5.1 3.4-11.3v-32.4c0-7-2.7-11-4.7-13z"}),jsx("path",{className:"st7",d:"M563.7 278.6c2.5-2.6 5.8-2.5 5.8-2.5v63.2s-3.9.4-7.1-4c-.7-.7-3.4-5.1-3.4-11.3v-32.4c0-6.9 2.7-10.9 4.7-13z"}),jsx("path",{className:"st9",d:"M592.9 278.5c-2.5-2.6-5.8-2.5-5.8-2.5v63.2s3.9.4 7.1-4c.7-.7 3.4-5.1 3.4-11.3v-32.4c0-7-2.7-11-4.7-13z"}),jsx("path",{className:"st10",d:"M220.2 323.1v34.2l73.4-.6zM293.7 356.6l73.5-33.6v34.3"})]})]})};function ChippyLoader(e){const t=e.width||defaultChippy.width,o=e.width||defaultChippy.height,n=t*.25,[r,s]=[o+n*2,t+n*2],a=useAppSelector(getSelectedTheme);return jsx(LoaderContainer,{children:jsx(CircleContainer,{$progress:e.progress,$progressColor:getDarkenedColor(a.accent.c,.9),$containerHeight:r,$containerWidth:s,children:jsx("div",{style:{zIndex:1,width:t},children:jsx(SvgComponent,{theme:e.theme})})})})}const LoadingText=ut.div`
  font-size: 30px;
  color: var(--color_label-highlighted);
`;function LoadingText$1(e){return jsx(LoadingText,{"data-tid":"loading-message",children:e.isSearching?"Searching for devices...":"Loading..."})}const Button=ut.div`
  display: flex;
  transition: transform 0.2s ease-out;
  user-select: none;
  color: #717070;
  border: 1px #717070 solid;
  width: 45px;
  height: 45px;
  padding: 2px;
  margin: 2px;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  white-space: pre-wrap;
  box-shadow: #8c8c8c 0 1px 0 0;
  &:hover {
    transform: translate3d(0, -2px, 0);
  }
`,title$3="Keymap",component$3=e=>jsx(FontAwesomeIcon,{icon:faBook}),Message$1=ut.span`
  font-size: 18px;
  margin: 8px;
  text-align: center;
`,ErrorMessage=ut(Message$1)`
  color: #d15e5e;
`,SuccessMessage=ut(Message$1)`
  color: #9ab46a;
`,Encoder=ut(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`,Container$c=ut.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`,renderEncoderError=()=>jsx(ErrorMessage,{children:"Your current firmware does not support rotary encoders. Install the latest firmware for your device."}),Pane$7=()=>{const[e,t]=reactExports.useState(),[o,n]=reactExports.useState(),r=useAppSelector(getSelectedKey),s=useAppDispatch(),a=useAppSelector(getSelectedKeyDefinitions),i=useAppSelector(K=>getSelectedKeymap(K)||[]),c=useAppSelector(getSelectedLayerIndex),l=useAppSelector(getSelectedConnectedDevice),d=useAppSelector(getSelectedKeyboardAPI),u=i[r??-1],C=a[r??-1],_=!!C&&C.col!==-1&&C.row!==-1,h=(K,g)=>{if(d&&r!==null&&C&&C.ei!==void 0){const y=+C.ei;switch(K){case"ccw":{d.setEncoderValue(c,y,!1,g),n(g);break}case"cw":{d.setEncoderValue(c,y,!0,g),t(g);break}case"click":{s(updateKey(r,g));break}}}},p=async(K,g,y)=>{const m=await y.getEncoderValue(K,g,!0),S=await y.getEncoderValue(K,g,!1);t(m),n(S)};return reactExports.useEffect(()=>{if(l&&l.protocol>=10&&C!==void 0&&C.ei!==void 0&&d){const K=+C.ei;p(c,K,d)}},[C,l,c]),C===void 0||l&&l.protocol<10||o===void 0||e===void 0?jsx(SpanOverflowCell,{children:renderEncoderError()}):jsx(SpanOverflowCell,{children:jsx(Encoder,{children:jsxs(Container$c,{children:[jsxs(ControlRow,{children:[jsx(Label$1,{children:"Rotate Counterclockwise"}),jsx(Detail,{children:jsx(PelpiKeycodeInput,{value:o,meta:{},setValue:K=>h("ccw",K)})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Rotate Clockwise"}),jsx(Detail,{children:jsx(PelpiKeycodeInput,{value:e,meta:{},setValue:K=>h("cw",K)})})]}),_&&jsxs(ControlRow,{children:[jsx(Label$1,{children:"Press Encoder"}),jsx(Detail,{children:jsx(PelpiKeycodeInput,{value:u,meta:{},setValue:K=>h("click",K)})})]})]})})})},KeycodeList=ut.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 64px);
  grid-auto-rows: 64px;
  justify-content: center;
  grid-gap: 10px;
`,MenuContainer$4=ut.div`
  padding: 15px 20px 20px 10px;
`,Keycode=ut(Button)`
  width: 50px;
  height: 50px;
  line-height: 18px;
  border-radius: 64px;
  font-size: 14px;
  border: 4px solid var(--border_color_icon);
  background: var(--bg_control);
  color: var(--color_label-highlighted);
  margin: 0;
  box-shadow: none;
  position: relative;
  border-radius: 10px;
  &:hover {
    border-color: var(--color_accent);
    transform: translate3d(0, -2px, 0);
  }
  ${e=>e.disabled&&"cursor:not-allowed;filter:opacity(50%);"}
`,KeycodeContent=ut.div`
  text-overflow: ellipsis;
  overflow: hidden;
`,CustomKeycode=ut(Button)`
  width: 50px;
  height: 50px;
  line-height: 18px;
  border-radius: 10px;
  font-size: 14px;
  border: 4px solid var(--border_color_icon);
  background: var(--color_accent);
  border-color: var(--color_inside_accent);
  color: var(--color_inside_accent);
  margin: 0;
`,KeycodeContainer=ut.div`
  padding: 12px;
  padding-bottom: 30px;
`,KeycodeDesc=ut.div`
  position: fixed;
  bottom: 0;
  background: #d9d9d97a;
  box-sizing: border-box;
  transition: opacity 0.4s ease-out;
  height: 25px;
  width: 100%;
  line-height: 14px;
  padding: 5px;
  font-size: 14px;
  opacity: 1;
  pointer-events: none;
  &:empty {
    opacity: 0;
  }
`,generateKeycodeCategories=(e,t=16)=>getKeycodes(t).concat(getOtherMenu(e)),maybeFilter=(e,t)=>e?()=>!0:t,Pane$6=()=>{const e=useAppSelector(getSelectedKey),t=useAppDispatch(),o=useAppSelector(getSelectedKeyDefinitions);return reactExports.useEffect(()=>()=>{t(updateSelectedKey(null))},[]),e!==null&&o[e].ei!==void 0?jsx(Pane$7,{}):jsx(KeycodePane,{})},KeycodePane=()=>{var I;const e=useAppDispatch(),t=useAppSelector(f=>f.macros),o=useAppSelector(getSelectedDefinition),n=useAppSelector(getSelectedConnectedDevice),r=useAppSelector(getSelectedKeymap),s=useAppSelector(getSelectedKey),a=useAppSelector(getDisableFastRemap),i=useAppSelector(getSelectedKeyDefinitions),{basicKeyToByte:c}=useAppSelector(getBasicKeyToByte),l=useAppSelector(getMacroCount),d=reactExports.useMemo(()=>generateKeycodeCategories(c,l),[c,l]);if(!o||!n||!r)return null;const[u,C]=reactExports.useState(d[0].id),[_,h]=reactExports.useState(null),[p,K]=reactExports.useState(!1),g=()=>{if(dist.isVIADefinitionV3(o))return y(o);const{lighting:f,customKeycodes:A}=o,{keycodes:w}=dist.getLightingDefinition(f);return d.filter(maybeFilter(w===dist.KeycodeType.QMK,({id:L})=>L!=="qmk_lighting")).filter(maybeFilter(w===dist.KeycodeType.WT,({id:L})=>L!=="lighting")).filter(maybeFilter(typeof A<"u",({id:L})=>L!=="custom"))},y=f=>{const w=["default",...f.keycodes||[]].flatMap(L=>categoriesForKeycodeModule(L));return(o.customKeycodes||[]).length!==0&&w.push("custom"),d.filter(L=>w.includes(L.id))},m=()=>jsx(ErrorMessage,{children:"Your current firmware does not support macros. Install the latest firmware for your device."}),S=()=>jsx(MenuContainer$4,{children:g().map(({id:f,label:A})=>jsx(SubmenuRow,{$selected:f===u,onClick:()=>C(f),children:A},f))}),b=()=>(e(disableGlobalHotKeys()),jsx(KeycodeModal,{defaultValue:s!==null?r[s]:void 0,onExit:()=>{e(enableGlobalHotKeys()),K(!1)},onConfirm:f=>{e(enableGlobalHotKeys()),E(f),K(!1)}})),E=f=>{s!==null&&(e(updateKey(s,f)),e(updateSelectedKey(a||!i?null:getNextKey(s,i))))},M=(f,A)=>{if(f=="text")K(!0);else return keycodeInMaster(f,c)&&E(getByteForCode(f,c))},T=(f,A)=>{const{code:w,title:L,name:D}=f;return jsx(Keycode,{disabled:!keycodeInMaster(w,c)&&w!="text",onClick:()=>M(w),onMouseOver:()=>h(L?`${w}: ${L}`:w),onMouseOut:()=>h(null),children:jsx(KeycodeContent,{children:D})},w)},O=()=>jsx(CustomKeycode,{onClick:()=>s!==null&&M("text"),onMouseOver:()=>h("Enter any QMK Keycode"),onMouseOut:()=>h(null),children:"Any"},"customKeycode"),v=(f,A)=>{const w=f.map((L,D)=>T(L));switch(A){case"macro":return t.isFeatureSupported?jsx(KeycodeList,{children:w}):m();case"special":return jsx(KeycodeList,{children:w.concat(O())});case"custom":return!dist.isVIADefinitionV2(o)&&!dist.isVIADefinitionV3(o)||!o.customKeycodes?null:jsx(KeycodeList,{children:o.customKeycodes.map((L,D)=>T({...L,code:`CUSTOM(${D})`}))});default:return jsx(KeycodeList,{children:w})}},P=(I=d.find(({id:f})=>f===u))==null?void 0:I.keycodes;return jsxs(Fragment,{children:[jsx(SubmenuOverflowCell,{children:S()}),jsxs(OverflowCell,{children:[jsx(KeycodeContainer,{children:v(P,u)}),jsx(KeycodeDesc,{children:_}),p&&b()]})]})},Icon$5=component$3,Title$5=title$3,Keycode$1=Object.freeze(Object.defineProperty({__proto__:null,Icon:Icon$5,KeycodePane,Pane:Pane$6,Title:Title$5},Symbol.toStringTag,{value:"Module"})),LightingControl=e=>{const t=useAppDispatch(),o=useAppSelector(getSelectedLightingData),n=useAppSelector(getSelectedDefinition),[r,s,a]=e.meta,i=o&&o[r];if(!i||!n)return null;const c=typeof s=="string"?s:s(e);switch(a.type){case"slider":return jsxs(ControlRow,{children:[jsx(Label$1,{children:c}),jsx(Detail,{children:jsx(AccentSlider,{isChecked:!!i[0],onChange:l=>t(updateBacklightValue(r,+l))})})]});case"range":return jsxs(ControlRow,{children:[jsx(Label$1,{children:c}),jsx(Detail,{children:jsx(AccentRange,{max:a.max,min:a.min,defaultValue:i[0],onChange:l=>t(updateBacklightValue(r,l))})})]});case"color":return jsxs(ControlRow,{children:[jsx(Label$1,{children:c}),jsx(Detail,{children:jsx(ArrayColorPicker,{color:i,setColor:(l,d)=>t(updateBacklightValue(r,l,d))})})]});case"select":{const l=a.getOptions(n).map((d,u)=>({value:u,label:d}));return jsxs(ControlRow,{children:[jsx(Label$1,{children:c}),jsx(Detail,{children:jsx(AccentSelect,{onChange:d=>{d&&t(updateBacklightValue(r,+d.value))},options:l,defaultValue:l.find(d=>i[0]===d.value)})})]})}case"row_col":return jsxs(ControlRow,{children:[jsx(Label$1,{children:c}),jsx(Detail,{children:jsx(AccentSlider,{isChecked:i[0]!==255,onChange:l=>{t(updateBacklightValue(r,...l?[254,254]:[255,255]))}})})]})}return null},BacklightControls=[[dist.LightingValue.BACKLIGHT_BRIGHTNESS,"Brightness",{type:"range",min:0,max:255}],[dist.LightingValue.BACKLIGHT_EFFECT,"Effect",{type:"select",getOptions:e=>dist.isVIADefinitionV2(e)&&dist.getLightingDefinition(e.lighting).effects.map(([t])=>t)}],[dist.LightingValue.BACKLIGHT_EFFECT_SPEED,"Effect Speed",{type:"range",min:0,max:3}]],UnderglowControls=[[dist.LightingValue.QMK_RGBLIGHT_BRIGHTNESS,"Underglow Brightness",{type:"range",min:0,max:255}],[dist.LightingValue.QMK_RGBLIGHT_EFFECT,"Underglow Effect",{type:"select",getOptions:e=>dist.isVIADefinitionV2(e)&&dist.getLightingDefinition(e.lighting).underglowEffects.map(([t])=>t)}],[dist.LightingValue.QMK_RGBLIGHT_EFFECT_SPEED,"Underglow Effect Speed",{type:"range",min:0,max:3}]],GeneralPane=()=>{const e=useAppDispatch(),t=useAppSelector(getSelectedLightingData),o=useAppSelector(getSelectedDefinition);if(!t)return null;if(!dist.isVIADefinitionV2(o))throw new Error("This lighting component is only compatible with v2 definitions");const n=dist.getLightingDefinition(o.lighting),{supportedLightingValues:r}=n;if(n.supportedLightingValues.length!==0){const s=n.effects.map(([_,h])=>h),a=n.underglowEffects.map(([_,h])=>h),i=t[dist.LightingValue.BACKLIGHT_EFFECT],c=t[dist.LightingValue.QMK_RGBLIGHT_EFFECT],l=i&&s[i[0]]||0,d=c&&a[c[0]]===1,C=!!t.customColors&&l>2;return jsxs(Fragment,{children:[BacklightControls.filter(_=>r.indexOf(_[0])!==-1).map(_=>jsx(LightingControl,{meta:_})),UnderglowControls.filter(_=>r.indexOf(_[0])!==-1).map(_=>jsx(LightingControl,{meta:_})),new Array(l).fill(1).map((_,h)=>_+h).map(_=>{let h,p;const K=_===1?dist.LightingValue.BACKLIGHT_COLOR_1:dist.LightingValue.BACKLIGHT_COLOR_2,g=t[K];if(C&&t.customColors)[h,p]=[t.customColors[_-1],(y,m)=>e(updateCustomColor(_-1,y,m))];else if(g)[h,p]=[{hue:g[0],sat:g[1]},(y,m)=>e(updateBacklightValue(K,y,m))];else return null;return jsxs(ControlRow,{children:[jsxs(Label$1,{children:["Color ",_]}),jsx(Detail,{children:jsx(ColorPicker,{color:h,setColor:p})})]},_)}),d&&jsx(LightingControl,{meta:[dist.LightingValue.QMK_RGBLIGHT_COLOR,"Underglow Color",{type:"color"}]})]})}return null},LayoutConfigValues=[dist.LightingValue.BACKLIGHT_USE_7U_SPACEBAR,dist.LightingValue.BACKLIGHT_USE_ISO_ENTER,dist.LightingValue.BACKLIGHT_USE_SPLIT_BACKSPACE,dist.LightingValue.BACKLIGHT_USE_SPLIT_LEFT_SHIFT,dist.LightingValue.BACKLIGHT_USE_SPLIT_RIGHT_SHIFT,dist.LightingValue.BACKLIGHT_DISABLE_HHKB_BLOCKER_LEDS],BooleanControls=[[dist.LightingValue.BACKLIGHT_USE_7U_SPACEBAR,"Use 7U Spacebar LEDs"],[dist.LightingValue.BACKLIGHT_USE_ISO_ENTER,"Use ISO Enter LEDs"],[dist.LightingValue.BACKLIGHT_USE_SPLIT_BACKSPACE,"Use Split Backspace LEDs"],[dist.LightingValue.BACKLIGHT_USE_SPLIT_LEFT_SHIFT,"Use Split Left Shift LEDs"],[dist.LightingValue.BACKLIGHT_USE_SPLIT_RIGHT_SHIFT,"Use Split Right Shift LEDs"],[dist.LightingValue.BACKLIGHT_DISABLE_HHKB_BLOCKER_LEDS,"Disable HHKB Blocker LEDs"]],Pane$5=()=>{const e=useAppDispatch(),t=useAppSelector(getSelectedLightingData),o=useAppSelector(getSelectedDefinition);if(!t)return null;if(!dist.isVIADefinitionV2(o))throw new Error("This lighting component is only compatible with v2 definitions");const n=dist.getLightingDefinition(o.lighting);if(n.supportedLightingValues.length!==0){const r=BooleanControls.filter(s=>n.supportedLightingValues.indexOf(s[0])!==-1);return jsx(Fragment,{children:r.map(([s,a])=>{const i=t&&t[s],c=i&&i[0];return jsxs(ControlRow,{children:[jsx(Label$1,{children:a}),jsx(Detail,{children:jsx(AccentSlider,{isChecked:!!c,onChange:l=>e(updateBacklightValue(s,+l))})})]},s)})})}return null},AdvancedLightingValues=[dist.LightingValue.BACKLIGHT_DISABLE_WHEN_USB_SUSPENDED,dist.LightingValue.BACKLIGHT_DISABLE_AFTER_TIMEOUT,dist.LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_COLOR,dist.LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_ROW_COL,dist.LightingValue.BACKLIGHT_LAYER_1_INDICATOR_COLOR,dist.LightingValue.BACKLIGHT_LAYER_1_INDICATOR_ROW_COL,dist.LightingValue.BACKLIGHT_LAYER_2_INDICATOR_COLOR,dist.LightingValue.BACKLIGHT_LAYER_2_INDICATOR_ROW_COL,dist.LightingValue.BACKLIGHT_LAYER_3_INDICATOR_COLOR,dist.LightingValue.BACKLIGHT_LAYER_3_INDICATOR_ROW_COL],AccentText=ut.span`
  color: var(--color_accent);
`,RGBControls=[[dist.LightingValue.BACKLIGHT_DISABLE_WHEN_USB_SUSPENDED,"Disable LEDs when USB is suspended",{type:"slider"}],[dist.LightingValue.BACKLIGHT_DISABLE_AFTER_TIMEOUT,()=>{const e=useAppSelector(getSelectedLightingData),t=e&&e[dist.LightingValue.BACKLIGHT_DISABLE_AFTER_TIMEOUT];return t?jsxs("span",{children:["LED Sleep Timeout:"," ",jsx(AccentText,{children:t[0]?`After ${t[0]} mins`:"Never"})]}):null},{type:"range",min:0,max:255}],[dist.LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_COLOR,"Caps Lock indicator color",{type:"color"}],[dist.LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_ROW_COL,"Caps Lock indicator",{type:"row_col"}],[dist.LightingValue.BACKLIGHT_LAYER_1_INDICATOR_COLOR,"Layer 1 indicator color",{type:"color"}],[dist.LightingValue.BACKLIGHT_LAYER_1_INDICATOR_ROW_COL,"Layer 1 indicator",{type:"row_col"}],[dist.LightingValue.BACKLIGHT_LAYER_2_INDICATOR_COLOR,"Layer 2 indicator color",{type:"color"}],[dist.LightingValue.BACKLIGHT_LAYER_2_INDICATOR_ROW_COL,"Layer 2 indicator",{type:"row_col"}],[dist.LightingValue.BACKLIGHT_LAYER_3_INDICATOR_COLOR,"Layer 3 indicator color",{type:"color"}],[dist.LightingValue.BACKLIGHT_LAYER_3_INDICATOR_ROW_COL,"Layer 3 indicator",{type:"row_col"}]],AdvancedPane=()=>{const e=useAppSelector(getSelectedLightingData),t=useAppSelector(getSelectedDefinition);if(dist.isVIADefinitionV2(t)&&e){const{supportedLightingValues:o}=dist.getLightingDefinition(t.lighting);return jsx(Fragment,{children:RGBControls.filter(n=>o.indexOf(n[0])!==-1).map(n=>jsx(LightingControl,{meta:n}))})}return null},Category={General:{label:"General",Menu:GeneralPane},Layout:{label:"Layout",Menu:Pane$5},Advanced:{label:"Advanced",Menu:AdvancedPane}},LightingPane=ut(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`,Container$b=ut.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`,MenuContainer$3=ut.div`
  padding: 15px 20px 20px 10px;
`,Pane$4=()=>{const e=useAppSelector(getSelectedDefinition),[t,o]=reactExports.useState(Category.General);return jsxs(Fragment,{children:[jsx(SubmenuCell,{children:jsx(MenuContainer$3,{children:(()=>{if(!dist.isVIADefinitionV2(e))throw new Error("This lighting component is only compatible with v2 definitions");const r=LayoutConfigValues.some(a=>dist.getLightingDefinition(e.lighting).supportedLightingValues.indexOf(a)!==-1),s=AdvancedLightingValues.some(a=>dist.getLightingDefinition(e.lighting).supportedLightingValues.indexOf(a)!==-1);return[Category.General,...r?[Category.Layout]:[],...s?[Category.Advanced]:[]].filter(({Menu:a})=>!!a)})().map(r=>jsx(SubmenuRow,{$selected:t===r,onClick:()=>o(r),children:r.label},r.label))})}),jsx(OverflowCell,{children:jsx(LightingPane,{children:jsx(Container$b,{children:jsx(t.Menu,{})})})})]})},Icon$4=component$4,Title$4=title$4,Lighting=Object.freeze(Object.defineProperty({__proto__:null,Category,Icon:Icon$4,Pane:Pane$4,Title:Title$4},Symbol.toStringTag,{value:"Module"})),SvgIcAdjust24Px=e=>jsx("svg",{width:16.571,height:16.571,...e,children:jsx("path",{d:"M8.285 0a8.285 8.285 0 108.285 8.285A8.3 8.3 0 008.285 0zm0 14.914a6.628 6.628 0 116.628-6.628 6.637 6.637 0 01-6.628 6.628zm2.486-6.628A2.486 2.486 0 118.285 5.8a2.482 2.482 0 012.486 2.485z",fill:"currentColor"})}),title$2="Macros",component$2=SvgIcAdjust24Px,matrixKeycodes=[basicKeyToByte.KC_ESC,basicKeyToByte.KC_F1,basicKeyToByte.KC_F2,basicKeyToByte.KC_F3,basicKeyToByte.KC_F4,basicKeyToByte.KC_F5,basicKeyToByte.KC_F6,basicKeyToByte.KC_F7,basicKeyToByte.KC_F8,basicKeyToByte.KC_F9,basicKeyToByte.KC_F10,basicKeyToByte.KC_F11,basicKeyToByte.KC_F12,basicKeyToByte.KC_PSCR,basicKeyToByte.KC_SLCK,basicKeyToByte.KC_PAUS,basicKeyToByte.KC_SLEP,basicKeyToByte.KC_MUTE,basicKeyToByte.KC_VOLD,basicKeyToByte.KC_VOLU,basicKeyToByte.KC_GRV,basicKeyToByte.KC_1,basicKeyToByte.KC_2,basicKeyToByte.KC_3,basicKeyToByte.KC_4,basicKeyToByte.KC_5,basicKeyToByte.KC_6,basicKeyToByte.KC_7,basicKeyToByte.KC_8,basicKeyToByte.KC_9,basicKeyToByte.KC_0,basicKeyToByte.KC_MINS,basicKeyToByte.KC_EQL,basicKeyToByte.KC_BSPC,basicKeyToByte.KC_INS,basicKeyToByte.KC_HOME,basicKeyToByte.KC_PGUP,basicKeyToByte.KC_NLCK,basicKeyToByte.KC_PSLS,basicKeyToByte.KC_PAST,basicKeyToByte.KC_PMNS,basicKeyToByte.KC_TAB,basicKeyToByte.KC_Q,basicKeyToByte.KC_W,basicKeyToByte.KC_E,basicKeyToByte.KC_R,basicKeyToByte.KC_T,basicKeyToByte.KC_Y,basicKeyToByte.KC_U,basicKeyToByte.KC_I,basicKeyToByte.KC_O,basicKeyToByte.KC_P,basicKeyToByte.KC_LBRC,basicKeyToByte.KC_RBRC,basicKeyToByte.KC_BSLS,basicKeyToByte.KC_DEL,basicKeyToByte.KC_END,basicKeyToByte.KC_PGDN,basicKeyToByte.KC_P7,basicKeyToByte.KC_P8,basicKeyToByte.KC_P9,basicKeyToByte.KC_PPLS,basicKeyToByte.KC_CAPS,basicKeyToByte.KC_A,basicKeyToByte.KC_S,basicKeyToByte.KC_D,basicKeyToByte.KC_F,basicKeyToByte.KC_G,basicKeyToByte.KC_H,basicKeyToByte.KC_J,basicKeyToByte.KC_K,basicKeyToByte.KC_L,basicKeyToByte.KC_SCLN,basicKeyToByte.KC_QUOT,basicKeyToByte.KC_ENT,basicKeyToByte.KC_P4,basicKeyToByte.KC_P5,basicKeyToByte.KC_P6,basicKeyToByte.KC_LSFT,basicKeyToByte.KC_Z,basicKeyToByte.KC_X,basicKeyToByte.KC_C,basicKeyToByte.KC_V,basicKeyToByte.KC_B,basicKeyToByte.KC_N,basicKeyToByte.KC_M,basicKeyToByte.KC_COMM,basicKeyToByte.KC_DOT,basicKeyToByte.KC_SLSH,basicKeyToByte.KC_RSFT,basicKeyToByte.KC_UP,basicKeyToByte.KC_P1,basicKeyToByte.KC_P2,basicKeyToByte.KC_P3,basicKeyToByte.KC_PENT,basicKeyToByte.KC_LCTL,basicKeyToByte.KC_LGUI,basicKeyToByte.KC_LALT,basicKeyToByte.KC_SPC,basicKeyToByte.KC_RALT,basicKeyToByte.KC_RGUI,basicKeyToByte.KC_MENU,basicKeyToByte.KC_RCTL,basicKeyToByte.KC_LEFT,basicKeyToByte.KC_DOWN,basicKeyToByte.KC_RGHT,basicKeyToByte.KC_P0,basicKeyToByte.KC_PDOT],evtToKeyByte={Digit1:basicKeyToByte.KC_1,Digit2:basicKeyToByte.KC_2,Digit3:basicKeyToByte.KC_3,Digit4:basicKeyToByte.KC_4,Digit5:basicKeyToByte.KC_5,Digit6:basicKeyToByte.KC_6,Digit7:basicKeyToByte.KC_7,Digit8:basicKeyToByte.KC_8,Digit9:basicKeyToByte.KC_9,Digit0:basicKeyToByte.KC_0,KeyA:basicKeyToByte.KC_A,KeyB:basicKeyToByte.KC_B,KeyC:basicKeyToByte.KC_C,KeyD:basicKeyToByte.KC_D,KeyE:basicKeyToByte.KC_E,KeyF:basicKeyToByte.KC_F,KeyG:basicKeyToByte.KC_G,KeyH:basicKeyToByte.KC_H,KeyI:basicKeyToByte.KC_I,KeyJ:basicKeyToByte.KC_J,KeyK:basicKeyToByte.KC_K,KeyL:basicKeyToByte.KC_L,KeyM:basicKeyToByte.KC_M,KeyN:basicKeyToByte.KC_N,KeyO:basicKeyToByte.KC_O,KeyP:basicKeyToByte.KC_P,KeyQ:basicKeyToByte.KC_Q,KeyR:basicKeyToByte.KC_R,KeyS:basicKeyToByte.KC_S,KeyT:basicKeyToByte.KC_T,KeyU:basicKeyToByte.KC_U,KeyV:basicKeyToByte.KC_V,KeyW:basicKeyToByte.KC_W,KeyX:basicKeyToByte.KC_X,KeyY:basicKeyToByte.KC_Y,KeyZ:basicKeyToByte.KC_Z,Comma:basicKeyToByte.KC_COMM,Period:basicKeyToByte.KC_DOT,Semicolon:basicKeyToByte.KC_SCLN,Quote:basicKeyToByte.KC_QUOT,BracketLeft:basicKeyToByte.KC_LBRC,BracketRight:basicKeyToByte.KC_RBRC,Backspace:basicKeyToByte.KC_BSPC,Backquote:basicKeyToByte.KC_GRV,Slash:basicKeyToByte.KC_SLSH,Backslash:basicKeyToByte.KC_BSLS,Minus:basicKeyToByte.KC_MINS,Equal:basicKeyToByte.KC_EQL,IntlRo:basicKeyToByte.KC_RO,IntlYen:basicKeyToByte.KC_JYEN,AltLeft:basicKeyToByte.KC_LALT,AltRight:basicKeyToByte.KC_RALT,CapsLock:basicKeyToByte.KC_CAPS,ControlLeft:basicKeyToByte.KC_LCTL,ControlRight:basicKeyToByte.KC_RCTL,MetaLeft:basicKeyToByte.KC_LGUI,MetaRight:basicKeyToByte.KC_RGUI,OSLeft:basicKeyToByte.KC_LGUI,OSRight:basicKeyToByte.KC_RGUI,ShiftLeft:basicKeyToByte.KC_LSFT,ShiftRight:basicKeyToByte.KC_RSFT,ContextMenu:basicKeyToByte.KC_APP,Enter:basicKeyToByte.KC_ENT,Space:basicKeyToByte.KC_SPC,Tab:basicKeyToByte.KC_TAB,Delete:basicKeyToByte.KC_DEL,End:basicKeyToByte.KC_END,Help:basicKeyToByte.KC_HELP,Home:basicKeyToByte.KC_HOME,Insert:basicKeyToByte.KC_INS,PageDown:basicKeyToByte.KC_PGDN,PageUp:basicKeyToByte.KC_PGUP,ArrowDown:basicKeyToByte.KC_DOWN,ArrowLeft:basicKeyToByte.KC_LEFT,ArrowRight:basicKeyToByte.KC_RGHT,ArrowUp:basicKeyToByte.KC_UP,Escape:basicKeyToByte.KC_ESC,PrintScreen:basicKeyToByte.KC_PSCR,ScrollLock:basicKeyToByte.KC_SLCK,AudioVolumeUp:basicKeyToByte.KC_VOLU,AudioVolumeDown:basicKeyToByte.KC_VOLD,AudioVolumeMute:basicKeyToByte.KC_MUTE,Pause:basicKeyToByte.KC_PAUS,F1:basicKeyToByte.KC_F1,F2:basicKeyToByte.KC_F2,F3:basicKeyToByte.KC_F3,F4:basicKeyToByte.KC_F4,F5:basicKeyToByte.KC_F5,F6:basicKeyToByte.KC_F6,F7:basicKeyToByte.KC_F7,F8:basicKeyToByte.KC_F8,F9:basicKeyToByte.KC_F9,F10:basicKeyToByte.KC_F10,F11:basicKeyToByte.KC_F11,F12:basicKeyToByte.KC_F12,F13:basicKeyToByte.KC_F13,F14:basicKeyToByte.KC_F14,F15:basicKeyToByte.KC_F15,F16:basicKeyToByte.KC_F16,F17:basicKeyToByte.KC_F17,F18:basicKeyToByte.KC_F18,F19:basicKeyToByte.KC_F19,F20:basicKeyToByte.KC_F20,F21:basicKeyToByte.KC_F21,F22:basicKeyToByte.KC_F22,F23:basicKeyToByte.KC_F23,F24:basicKeyToByte.KC_F24,NumLock:basicKeyToByte.KC_NLCK,Numpad0:basicKeyToByte.KC_P0,Numpad1:basicKeyToByte.KC_P1,Numpad2:basicKeyToByte.KC_P2,Numpad3:basicKeyToByte.KC_P3,Numpad4:basicKeyToByte.KC_P4,Numpad5:basicKeyToByte.KC_P5,Numpad6:basicKeyToByte.KC_P6,Numpad7:basicKeyToByte.KC_P7,Numpad8:basicKeyToByte.KC_P8,Numpad9:basicKeyToByte.KC_P9,NumpadAdd:basicKeyToByte.KC_PPLS,NumpadComma:basicKeyToByte.KC_COMM,NumpadDecimal:basicKeyToByte.KC_PDOT,NumpadDivide:basicKeyToByte.KC_PSLS,NumpadEnter:basicKeyToByte.KC_PENT,NumpadEqual:basicKeyToByte.KC_PEQL,NumpadMultiply:basicKeyToByte.KC_PAST,NumpadSubtract:basicKeyToByte.KC_PMNS};function getIndexByEvent(e){const t=e.code,o=evtToKeyByte[t]||evtToKeyByte[e.key];return o?matrixKeycodes.indexOf(o):-1}function mapEvtToKeycode(e){switch(e.code){case"Digit1":return"KC_1";case"Digit2":return"KC_2";case"Digit3":return"KC_3";case"Digit4":return"KC_4";case"Digit5":return"KC_5";case"Digit6":return"KC_6";case"Digit7":return"KC_7";case"Digit8":return"KC_8";case"Digit9":return"KC_9";case"Digit0":return"KC_0";case"KeyA":return"KC_A";case"KeyB":return"KC_B";case"KeyC":return"KC_C";case"KeyD":return"KC_D";case"KeyE":return"KC_E";case"KeyF":return"KC_F";case"KeyG":return"KC_G";case"KeyH":return"KC_H";case"KeyI":return"KC_I";case"KeyJ":return"KC_J";case"KeyK":return"KC_K";case"KeyL":return"KC_L";case"KeyM":return"KC_M";case"KeyN":return"KC_N";case"KeyO":return"KC_O";case"KeyP":return"KC_P";case"KeyQ":return"KC_Q";case"KeyR":return"KC_R";case"KeyS":return"KC_S";case"KeyT":return"KC_T";case"KeyU":return"KC_U";case"KeyV":return"KC_V";case"KeyW":return"KC_W";case"KeyX":return"KC_X";case"KeyY":return"KC_Y";case"KeyZ":return"KC_Z";case"Comma":return"KC_COMM";case"Period":return"KC_DOT";case"Semicolon":return"KC_SCLN";case"Quote":return"KC_QUOT";case"BracketLeft":return"KC_LBRC";case"BracketRight":return"KC_RBRC";case"Backquote":return"KC_GRV";case"Slash":return"KC_SLSH";case"Backspace":return"KC_BSPC";case"Backslash":return"KC_BSLS";case"Minus":return"KC_MINS";case"Equal":return"KC_EQL";case"IntlRo":return"KC_RO";case"IntlYen":return"KC_JYEN";case"AltLeft":return"KC_LALT";case"AltRight":return"KC_RALT";case"CapsLock":return"KC_CAPS";case"ControlLeft":return"KC_LCTL";case"ControlRight":return"KC_RCTL";case"MetaLeft":return"KC_LGUI";case"MetaRight":return"KC_RGUI";case"OSLeft":return"KC_LGUI";case"OSRight":return"KC_RGUI";case"ShiftLeft":return"KC_LSFT";case"ShiftRight":return"KC_RSFT";case"ContextMenu":return"KC_APP";case"Apps":return"KC_APP";case"Enter":return"KC_ENT";case"Space":return"KC_SPC";case"Tab":return"KC_TAB";case"Delete":return"KC_DEL";case"End":return"KC_END";case"Help":return"KC_HELP";case"Home":return"KC_HOME";case"Insert":return"KC_INS";case"PageDown":return"KC_PGDN";case"PageUp":return"KC_PGUP";case"ArrowDown":return"KC_DOWN";case"ArrowLeft":return"KC_LEFT";case"ArrowRight":return"KC_RGHT";case"ArrowUp":return"KC_UP";case"Escape":return"KC_ESC";case"PrintScreen":return"KC_PSCR";case"ScrollLock":return"KC_SLCK";case"Pause":return"KC_PAUS";case"F1":return"KC_F1";case"F2":return"KC_F2";case"F3":return"KC_F3";case"F4":return"KC_F4";case"F5":return"KC_F5";case"F6":return"KC_F6";case"F7":return"KC_F7";case"F8":return"KC_F8";case"F9":return"KC_F9";case"F10":return"KC_F10";case"F11":return"KC_F11";case"F12":return"KC_F12";case"F13":return"KC_F13";case"F14":return"KC_F14";case"F15":return"KC_F15";case"F16":return"KC_F16";case"F17":return"KC_F17";case"F18":return"KC_F18";case"F19":return"KC_F19";case"F20":return"KC_F20";case"F21":return"KC_F21";case"F22":return"KC_F22";case"F23":return"KC_F23";case"F24":return"KC_F24";case"NumLock":return"KC_NLCK";case"Numpad0":return"KC_P0";case"Numpad1":return"KC_P1";case"Numpad2":return"KC_P2";case"Numpad3":return"KC_P3";case"Numpad4":return"KC_P4";case"Numpad5":return"KC_P5";case"Numpad6":return"KC_P6";case"Numpad7":return"KC_P7";case"Numpad8":return"KC_P8";case"Numpad9":return"KC_P9";case"NumpadAdd":return"KC_PPLS";case"NumpadComma":return"KC_COMM";case"NumpadDecimal":return"KC_PDOT";case"NumpadDivide":return"KC_PSLS";case"NumpadEnter":return"KC_PENT";case"NumpadEqual":return"KC_PEQL";case"NumpadMultiply":return"KC_PAST";case"NumpadSubtract":return"KC_PMNS";case"AudioVolumeUp":return"KC_VOLU";case"AudioVolumeDown":return"KC_VOLD";case"AudioVolumeMute":return"KC_MUTE";default:console.error("Unreacheable keydown code",e)}}let heldKeys={},lastEvtTime=0;const useKeycodeRecorder=(e,t)=>{const o=reactExports.useState([]),[,n]=o,r=reactExports.useMemo(()=>getKeycodes().flatMap(c=>c.keycodes),[]),s=reactExports.useCallback((c,l)=>{c.preventDefault(),e&&!c.repeat&&n(d=>{const u=r.find(h=>h.code===mapEvtToKeycode(c)),C=Date.now(),_=u==null?void 0:u.code;return d.length&&t&&d.push([RawKeycodeSequenceAction.Delay,C-lastEvtTime]),_&&d.push([l,_]),lastEvtTime=C,[...d]})},[e,t]),a=reactExports.useCallback(c=>{c.repeat||(heldKeys[c.code]=!0,s(c,RawKeycodeSequenceAction.Down))},[e]),i=reactExports.useCallback(c=>{heldKeys[c.code]=!1,s(c,RawKeycodeSequenceAction.Up)},[e]);return reactExports.useEffect(()=>(heldKeys={},e&&(window.addEventListener("keydown",a),window.addEventListener("keyup",i)),()=>{heldKeys={},window.removeEventListener("keydown",a),window.removeEventListener("keyup",i)}),[e]),o};ut.div`
  border: 2px solid var(--bg_control);
  transition: border-color 0.2s ease-in-out;
  margin: 15px 0px;
  display: inline-block;
  &:focus-within {
    border-color: var(--color_accent);
  }
  border-radius: 4px;
  font-size: 16px;
`;const KeycodeSequenceLabel=ut.div`
  display: inline-flex;
  user-select: none;
  color: #717070;
  padding: 6px 4px;
  text-overflow: ellipsis;
  min-width: 30px;
  font-size: 12px;
  text-align: center;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  white-space: pre-wrap;
  font-size: 16px;
  border: 2px solid var(--border_color_icon);
  background: var(--bg_control);
  color: var(--color_label-highlighted);
  margin: 0;
  box-shadow: none;
  position: relative;
  border-radius: 2px;
  white-space: nowrap;
  position: relative;
  margin: 15px 0px;
`,KeycodeDownLabel=ut(KeycodeSequenceLabel)`
  &::after {
    border-style: solid;
    border-color: transparent;
    content: '';
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid var(--color_accent);
    position: absolute;
    margin-top: 55px;
    width: 0;
  }
`,SequenceLabelSeparator=ut.div`
  width: 20px;
  display: inline-flex;
  vertical-align: middle;
  border: 1px solid var(--color_accent);
`,CharacterStreamLabel=ut(KeycodeSequenceLabel)`
  border-color: var(--border_color_cell);
  background: var(--bg_menu);
  white-space: pre-wrap;
  min-height: 1.25em;
  letter-spacing: 2px;
`,KeycodePressLabel=ut(KeycodeSequenceLabel)`
  border-color: var(--color_accent);
`,KeycodeUpLabel=ut(KeycodeSequenceLabel)`
  &::after {
    content: '';
    border-style: solid;
    margin-top: -55px;
    border-color: transparent;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid var(--color_accent);
    position: absolute;
    width: 0;
  }
`,KeycodeSequenceWait=ut.div`
  display: inline-flex;
  font-weight: bold;
  user-select: none;
  color: #717070;
  text-overflow: ellipsis;
  min-width: 30px;
  text-align: center;
  justify-content: center;
  align-items: center;
  white-space: pre-wrap;
  font-size: 16px;
  color: var(--color_label-highlighted);
  box-shadow: none;
  position: relative;
  white-space: nowrap;
  position: relative;
  margin: 15px 0px;
  box-sizing: border-box;
  border: 2px solid;
  padding: 4px 4px;
  border-color: var(--color_accent);
  border-radius: 2px;
`,NumberInput=ut.input.attrs({type:"number",placeholder:"XXXXX"})`
  appearance: none;
  background: none;
  border: none;
  border-bottom: 1px solid;
  color: var(--color_label);
  width: 45px;
  text-align: center;
  font-family: inherit;
  font-size: inherit;
  color: var(--color_label-highlighted);
  margin: 0 5px 0 0;
  &:focus {
    color: var(--color_accent);
  }
  &::-webkit-inner-spin-button {
    appearance: none;
    display: none;
  }
  &:invalid {
    color: red;
  }
  &:placeholder-shown {
    color: red;
  }
`,WaitInput=e=>{const t=reactExports.useRef(null),o=r=>{(!r.data||!/^\d$/.test(r.data))&&r.preventDefault()},n=r=>{+r.target.value>0&&+r.target.value<1e5&&e.updateValue(e.index,+r.target.value)};return jsxs(KeycodeSequenceWait,{children:[jsx(NumberInput,{ref:t,onBeforeInput:o,value:e.value,onChange:n}),"ms"]})},getSequenceItemComponent=e=>e===RawKeycodeSequenceAction.Down?KeycodeDownLabel:e===RawKeycodeSequenceAction.Up?KeycodeUpLabel:e===RawKeycodeSequenceAction.CharacterStream?CharacterStreamLabel:KeycodePressLabel;function capitalize(e){return e[0].toUpperCase()+e.slice(1)}const getSequenceLabel=e=>{const t=(e==null?void 0:e.keys)??(e==null?void 0:e.shortName)??(e==null?void 0:e.name)??"";return t.length>1?capitalize(t):t},IconButton=ut.button`
  appearance: none;
  width: 40px;
  position: relative;
  display: inline-block;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px 10px;
  line-height: initial;
  font-size: initial;
  color: ${e=>e.disabled?"var(--bg_control)":"var(--color_accent)"};
  border-color: ${e=>e.disabled?"var(--bg_control)":"var(--color_accent)"};
  &:disabled {
    cursor: not-allowed;
    border-right: 1px solid var(--border_color_icon);
    cursor: not-allowed;
    background: var(--bg_menu);
  }
  &:hover {
    color: ${e=>e.disabled?"var(--bg_control)":"var(--color_inside-accent)"};
    border-color: ${e=>e.disabled?"var(--bg_control)":"var(--color_accent)"};
    border-right: 1px solid var(--border_color_icon);
    background-color: ${e=>e.disabled?"var(--bg_menu)":"var(--color_accent)"};
  }

  svg {
    color: ${e=>e.disabled?"var(--bg_control)":"var(--color_accent)"};
  }
  &:hover {
    svg {
      color: ${e=>e.disabled?"var(--bg_control)":"var(--color_inside-accent)"};
    }

    color: var(--color_label-highlighted);
    & .tooltip {
      transform: scale(1) translateX(0px);
      opacity: 1;
    }
  }
  .tooltip {
    transform: translateX(-5px) scale(0.6);
    opacity: 0;
  }
`,IconButtonUnfilledContainer=ut(IconButton)`
  cursor: pointer;
  background: inherit;
  border: 1px solid var(--color_accent);
  width: 30px;
  height: 30px;
  justify-content: center;
  display: inline-flex;
  align-items: center;
`,IconButtonContainer=ut(IconButton)`
  cursor: pointer;
  background: var(--bg_control);
  border-right: 1px solid var(--border_color_icon);
`,IconToggleContainer=ut(IconButton)`
  cursor: pointer;
  transition: all 0.4s ease;
  background: ${e=>e.$selected?"var(--color_accent)":"var(--bg_menu)"};
  svg {
    color: ${e=>e.$selected?"var(--color_inside-accent)":"var(--bg_icon)"};
  }
  &:hover {
    background: ${e=>e.$selected?"var(--color_accent)":"var(--bg_menu)"};
    svg {
      color: ${e=>e.$selected?"var(--color_inside-accent)":"var(--bg_icon)"};
    }
  }
  border-right: 1px solid var(--border_color_icon);
`,Keycap2DTooltip=e=>{const t=reactExports.useMemo(()=>({containerStyles:{position:"absolute",left:"50%",transformOrigin:"left",transition:"all 0.1s ease-in-out",top:0,marginTop:-40,zIndex:4,pointerEvents:"none",filter:"drop-shadow(0px 0px 1px white)"},contentStyles:{padding:"5px 8px",borderRadius:10,background:"var(--color_accent)",color:"var(--color_inside-accent)",fontFamily:"'Fira Sans Condensed', Helvetica, Helvetica Neue, Arial, serif",fontSize:16,fontWeight:500,whiteSpace:"nowrap",display:"flex",justifyContent:"center",alignItems:"center",textTransform:"uppercase",zIndex:5,transform:"translateX(-50%)"},pointerStyles:{borderStyle:"solid",borderColor:"transparent",borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderTop:"6px solid var(--color_accent)",position:"absolute",marginLeft:-6,width:0}}),[]);return jsx(Tooltip,{...e,containerStyles:t.containerStyles,contentStyles:t.contentStyles,pointerStyles:t.pointerStyles})},KeycapTooltip=e=>{const t=reactExports.useMemo(()=>({containerStyles:{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",marginTop:-800},contentStyles:{padding:"70px 70px",background:"var(--color_accent)",color:"var(--color_inside-accent)",borderRadius:100,fontSize:200,fontFamily:"'Fira Sans', Helvetica, Helvetica Neue, Arial, serif",whiteSpace:"nowrap",letterSpacing:1,display:"flex",justifyContent:"center",alignItems:"center",fontWeight:"bold"},pointerStyles:{height:150,width:150,marginTop:-100,transform:"rotate(45deg)",background:"var(--color_accent)"}}),[]);return jsx(Tooltip,{...e,containerStyles:t.containerStyles,contentStyles:t.contentStyles,pointerStyles:t.pointerStyles})},CategoryMenuTooltip=e=>{const t=reactExports.useMemo(()=>({containerStyles:{position:"absolute",top:45,left:0,transformOrigin:"left",transition:"all 0.1s ease-in-out",marginTop:0,zIndex:4,pointerEvents:"none"},contentStyles:{padding:"5px 10px",borderRadius:10,background:"var(--color_accent)",color:"var(--color_inside-accent)",fontFamily:"'Fira Sans Condensed', Helvetica, Helvetica Neue, Arial, serif",fontSize:18,fontWeight:500,whiteSpace:"nowrap",display:"flex",justifyContent:"center",alignItems:"center",textTransform:"uppercase",zIndex:5,transform:"translateX(-50%)",marginLeft:18},pointerStyles:{borderStyle:"solid",borderColor:"transparent",borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderBottom:"6px solid var(--color_accent)",position:"absolute",marginLeft:15,marginTop:-41,width:0}}),[]);return jsx(Tooltip,{...e,containerStyles:t.containerStyles,contentStyles:t.contentStyles,pointerStyles:t.pointerStyles})},ProgressBarTooltip=e=>{const t=reactExports.useMemo(()=>({containerStyles:{position:"absolute",left:"50%",transformOrigin:"left",transition:"all 0.1s ease-in-out",top:0,marginTop:-40,zIndex:4,pointerEvents:"none"},contentStyles:{padding:"5px 10px",borderRadius:10,background:"var(--color_inside-accent)",color:"var(--color_accent)",fontFamily:"'Fira Sans Condensed', Helvetica, Helvetica Neue, Arial, serif",fontSize:18,fontWeight:500,whiteSpace:"nowrap",display:"flex",justifyContent:"center",alignItems:"center",textTransform:"uppercase",zIndex:5,transform:"translateX(-50%)"},pointerStyles:{borderStyle:"solid",borderColor:"transparent",borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderTop:"6px solid var(--color_inside-accent)",position:"absolute",marginLeft:-6,width:0}}),[]);return jsx(Tooltip,{...e,containerStyles:t.containerStyles,contentStyles:t.contentStyles,pointerStyles:t.pointerStyles})},IconButtonTooltip=e=>{const t=reactExports.useMemo(()=>({containerStyles:{position:"absolute",top:50,left:0,transformOrigin:"left",transition:"all 0.1s ease-in-out",marginTop:0,zIndex:4,pointerEvents:"none"},contentStyles:{padding:"5px 10px",borderRadius:10,background:"var(--color_inside-accent)",color:"var(--color_accent)",fontFamily:"'Fira Sans Condensed', Helvetica, Helvetica Neue, Arial, serif",fontSize:18,fontWeight:500,whiteSpace:"nowrap",display:"flex",justifyContent:"center",alignItems:"center",textTransform:"uppercase",zIndex:5,transform:"translateX(-50%)",marginLeft:18},pointerStyles:{borderStyle:"solid",borderColor:"transparent",borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderBottom:"6px solid var(--color_inside-accent)",position:"absolute",marginLeft:15,marginTop:-41,width:0}}),[]);return jsx(Tooltip,{...e,containerStyles:t.containerStyles,contentStyles:t.contentStyles,pointerStyles:t.pointerStyles})},MenuTooltip=e=>{const t=reactExports.useMemo(()=>({containerStyles:{position:"absolute",top:0,left:45,transformOrigin:"left",transition:"all 0.1s ease-in-out",marginTop:-5,zIndex:4,pointerEvents:"none"},contentStyles:{padding:"5px 5px",background:"var(--color_inside-accent)",color:"var(--color_accent)",borderRadius:10,fontFamily:"'Fira Sans Condensed', Helvetica, Helvetica Neue, Arial, serif",fontWeight:400,whiteSpace:"nowrap",display:"flex",justifyContent:"center",alignItems:"center",zIndex:5},pointerStyles:{borderStyle:"solid",borderColor:"transparent",borderTop:"6px solid transparent",borderBottom:"6px solid transparent",borderRight:"6px solid var(--color_inside-accent)",position:"absolute",marginLeft:-9,marginTop:-21,width:0}}),[]);return jsx(Tooltip,{...e,containerStyles:t.containerStyles,contentStyles:t.contentStyles,pointerStyles:t.pointerStyles})},Tooltip=e=>{const{containerStyles:t,contentStyles:o,pointerStyles:n}=e;return jsxs("div",{style:t,className:"tooltip",children:[jsx("div",{style:o,children:e.children}),jsx("div",{style:n})]})},MacroEditControlsContainer=ut.div`
  background: var(--bg_menu);
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
`,MacroControlGroupContainer=ut.div`
  border-radius: 2px;
  border: 1px solid var(--border_color_icon);
  display: inline-flex;
  > button:last-child {
    border: none;
  }
`,MacroControlGroupDivider=ut.div`
  background: var(--border_color_icon);
  width: 1px;
  height: 80%;
  margin: 0 10px;
`,MacroEditControls=({isFullscreen:e,isRecording:t,recordingToggleChange:o,hasUnsavedChanges:n,undoChanges:r,saveChanges:s,recordDelays:a,toggleRecordDelays:i,optimizeRecording:c,toggleOptimizeRecording:l,isEmpty:d,deleteMacro:u,toggleFullscreen:C,isDelaySupported:_})=>jsxs(MacroEditControlsContainer,{children:[n?jsx(Fragment,{children:t?null:jsxs(Fragment,{children:[jsxs(MacroControlGroupContainer,{children:[jsxs(IconButtonContainer,{disabled:!n||t,onClick:r,children:[jsx(FontAwesomeIcon,{size:"sm",color:"var(--color_label)",icon:faUndo}),jsx(IconButtonTooltip,{children:"Undo Changes"})]}),jsxs(IconButtonContainer,{disabled:!n||t,onClick:()=>s(),children:[jsx(FontAwesomeIcon,{size:"sm",color:"var(--color_label)",icon:faSave}),jsx(IconButtonTooltip,{children:"Save Changes"})]})]}),jsx(MacroControlGroupDivider,{})]})}):d?jsx(Fragment,{}):jsxs(Fragment,{children:[jsx(MacroControlGroupContainer,{children:jsxs(IconButtonContainer,{disabled:n||t,onClick:u,children:[jsx(FontAwesomeIcon,{size:"sm",color:"var(--color_label)",icon:faTrash}),jsx(IconButtonTooltip,{children:"Delete Macro"})]})}),jsx(MacroControlGroupDivider,{})]}),jsxs(MacroControlGroupContainer,{children:[jsxs(IconButtonContainer,{onClick:()=>{o(!t)},disabled:!e,children:[jsx(FontAwesomeIcon,{size:"sm",color:"var(--color_label)",icon:t?faSquare:faCircle}),jsx(IconButtonTooltip,{children:e?t?"Stop Recording":"Record Keystrokes":"Can only record when fullscreen"})]}),jsxs(IconButtonContainer,{onClick:C,children:[jsx(FontAwesomeIcon,{size:"sm",color:"var(--color_label)",icon:e?faCompress:faExpand}),jsx(IconButtonTooltip,{children:e?"Exit Fullscreen":"Fullscreen"})]})]}),t?null:jsxs(Fragment,{children:[jsx(MacroControlGroupDivider,{}),jsxs(MacroControlGroupContainer,{children:[jsxs(IconToggleContainer,{$selected:c,onClick:l,children:[jsx(FontAwesomeIcon,{size:"sm",icon:faMagicWandSparkles}),jsx(IconButtonTooltip,{children:c?"Skip Smart Optimization":"Use Smart Optimization"})]}),jsxs(IconToggleContainer,{disabled:!_,$selected:a,onClick:i,children:[jsx(FontAwesomeIcon,{size:"sm",icon:faStopwatch,className:"fa-stack-1x"}),jsx(IconButtonTooltip,{children:_?a?"Skip Recording Delays":"Record Delays":"Upgrade firmware to use delays"})]})]})]})]}),DeletableContainer=ut.div`
  display: inline-flex;
  vertical-align: middle;
  position: relative;
  svg {
    color: var(--bg_icon-highlighted);
    position: absolute;
    right: -5px;
    top: 6px;
    opacity: 0;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    background: var(--bg_icon);
    border-radius: 50%;
    transform: scale(0.8);
  }
  &:hover svg {
    opacity: 1;
    transform: scale(1);
  }
`,Deletable=e=>jsxs(DeletableContainer,{style:{pointerEvents:e.disabled?"none":"all"},children:[e.children,jsx(FontAwesomeIcon,{icon:faXmarkCircle,size:"lg",onClick:()=>e.deleteItem(e.index)})]}),pipeline=(e,...t)=>t.reduce((o,n)=>n(o),e),NoMacroRecorded=ut.div`
  font-style: italic;
  color: var(--color_label-highlighted);
`,MacroSequenceContainer=ut.div`
  max-width: 960px;
  width: 100%;
  display: block;
  border: 1px solid var(--border_color_cell);
  border-style: ${e=>e.$isModified?"dashed":"solid"};
  padding: 30px 20px;
  border-radius: 15px;
  margin-top: 10px;
  box-sizing: border-box;
}
`,componentJoin=(e,t)=>e.reduce((o,n,r)=>(r&&o.push({...t,key:r}),o.push(n),o),[]),KeycodeMap=getKeycodes().flatMap(e=>e.keycodes).reduce((e,t)=>({...e,[t.code]:t}),{}),optimizeKeycodeSequence=e=>pipeline(e,convertCharacterTaps,trimLastWait,mergeConsecutiveWaits,foldKeydownKeyupKeys,convertToCharacterStreams),cleanKeycodeSequence=e=>pipeline(e,mergeConsecutiveWaits),MacroRecorder=({selectedMacro:e,setUnsavedMacro:t,saveMacro:o,undoMacro:n,isDelaySupported:r})=>{const[s,a]=reactExports.useState(!0),[i,c]=reactExports.useState(!1),[l,d]=reactExports.useState(!1),[u,C]=reactExports.useState(!!document.fullscreenElement),{smartOptimizeEnabled:_,recordDelaysEnabled:h}=useAppSelector(getMacroEditorSettings),p=useDispatch(),[K,g]=useKeycodeRecorder(i,h),y=reactExports.useRef(null),m=reactExports.useCallback(async f=>{c(f),f?(await navigator.keyboard.lock(),g([]),a(!1),d(!0)):(navigator.keyboard.unlock(),_&&g(optimizeKeycodeSequence(K)),d(!1))},[K,c]),S=reactExports.useCallback(()=>{o(""),a(!0),d(!1)},[g,o]),b=reactExports.useCallback(()=>{n(),g([]),a(!0),d(!1)},[n]);reactExports.useEffect(()=>{a(!0),d(!1),g([])},[e]);const E=()=>[...s?e??[]:K],M=reactExports.useMemo(()=>{let f,A=E();return s||!l||!_?f=A:f=optimizeKeycodeSequence(A),f},[K,s,_,l,e]);reactExports.useEffect(()=>{M&&t(sequenceToExpression(M))},[M]);const T=reactExports.useCallback(()=>{s&&a(!1)},[s]),O=reactExports.useCallback(f=>{const A=E();A.splice(f,1),g(cleanKeycodeSequence(A)),T()},[M,e,K,s]),v=reactExports.useCallback((f,A)=>{const w=E();w.splice(f,1,[RawKeycodeSequenceAction.Delay,A]),g(cleanKeycodeSequence(w)),T()},[M,e,K,s]),P=reactExports.useMemo(()=>componentJoin(M.map(([f,A],w)=>{const L=getSequenceItemComponent(f);return jsx(Deletable,{index:w,deleteItem:O,disabled:i,children:RawKeycodeSequenceAction.Delay!==f?jsx(L,{children:f===RawKeycodeSequenceAction.CharacterStream?componentJoin(String(A).split(" ").map((D,k)=>jsx("span",{children:D},k)),jsx("span",{style:{fontFamily:"fantasy, cursive, monospace"},children:"␣"})):Array.isArray(A)?A.map(D=>getSequenceLabel(KeycodeMap[D])??D).join(" + "):getSequenceLabel(KeycodeMap[A])}):jsx(WaitInput,{index:w,value:Number(A),updateValue:v})},`${w}-${f}`)}),jsx(SequenceLabelSeparator,{})),[M]);reactExports.useEffect(()=>{const f=()=>{C(!!document.fullscreenElement)};return document.documentElement.addEventListener("fullscreenchange",f),()=>{m(!1),document.documentElement.removeEventListener("fullscreenchange",f)}},[C]);const I=reactExports.useCallback(()=>{document.fullscreenElement?document.exitFullscreen&&(m(!1),document.exitFullscreen()):document.documentElement.requestFullscreen()},[m]);return jsxs(Fragment,{children:[jsx(MacroSequenceContainer,{ref:y,$isModified:!s,children:P.length?P:jsx(NoMacroRecorded,{children:"No macro recorded yet..."})}),jsx("div",{style:{border:"none",maxWidth:960,width:"100%",display:"flex",justifyContent:"center",transform:"translate(-0px, -21px)"},children:jsx(MacroEditControls,{isFullscreen:u,isEmpty:!e||!e.length,optimizeRecording:_,recordDelays:h,isRecording:i,addText:()=>{},deleteMacro:S,toggleOptimizeRecording:()=>{p(setMacroEditorSettings({smartOptimizeEnabled:!_}))},toggleRecordDelays:()=>{p(setMacroEditorSettings({recordDelaysEnabled:!h}))},toggleFullscreen:I,undoChanges:b,saveChanges:()=>o(),hasUnsavedChanges:!s,recordingToggleChange:m,isDelaySupported:r})})]})},TextArea=ut.textarea`
  box-sizing: border-box;
  background: var(--bg_control);
  padding: 5px 10px;
  border-color: var(--border_color_icon);
  color: var(--color_label);
  width: 100%;
  height: 200px;
  font-size: 16px;
  line-height: 18px;
  resize: none;
  font-family: 'Source Code Pro';
  font-weight: 500;
  &::placeholder {
    color: var(--color_label);
  }
  &:focus {
    color: var(--color_accent);
    outline-color: var(--color_accent);
  }
`,ToastErrorMessage=ut(ErrorMessage)`
  margin: 0;
  width: 100%;
  font-size: 14px;
  display: block;
  &:empty {
    display: none;
  }
`,Message=ut.div`
  color: var(--color_accent);
`,Link=ut.a`
  font-size: 18x !important;
  color: var(--color_accent);
  text-decoration: underline;
`,DescriptionLabel=ut(Label$1)`
  margin: 1em 0;
  font-size: 14px;
  line-height: 18px;
  font-style: oblique;
  padding-left: 5px;
`,AutoHeightRow=ut(ControlRow)`
  height: auto;
`,ScriptMode=({macro:e,protocol:t,setUnsavedMacro:o,saveMacros:n,macroIndex:r,isDelaySupported:s})=>{const a=e.trimEnd(),[i,c]=React.useState(a),[l,d]=React.useState(void 0);reactExports.useEffect(()=>{o(i)},[i]);const u=()=>{const h=getMacroValidator(t)(i);h.isValid?(n(i),d(void 0)):d(h.errorMessage)};return jsxs(Fragment,{children:[jsx(AutoHeightRow,{children:jsx(ReactTextareaAutocomplete,{value:i,onChange:_=>c(_.target.value),loadingComponent:AutocompleteLoading,style:{fontSize:"16px",lineHeight:"18px",width:"100%",height:"140px",fontFamily:"monospace",resize:"none",borderColor:l!==void 0?"var(--color_error)":"var(--border_color_icon)"},containerStyle:{border:"none",lineHeight:"20px"},itemStyle:{borderColor:"var(--border_color_cell)",backgroundColor:"var(--bg_menu)"},dropdownStyle:{zIndex:999,backgroundColor:"var(--bg_menu)"},listStyle:{position:"fixed",backgroundColor:"var(--bg_menu)",maxHeight:"210px",overflow:"auto",border:"1px solid var(--border_color_cell)"},minChar:0,textAreaComponent:TextArea,movePopupAsYouType:!0,placeholder:`Enter the macro you want M${r} to execute...`,trigger:{"?":{dataProvider:findKeycodes,component:AutocompleteItem,output:_=>({text:_.code,caretPosition:"end"})},"{":{dataProvider:findKeycodes,component:AutocompleteItem,output:_=>({text:`{${_.code},`,caretPosition:"end"})},",":{dataProvider:findKeycodes,component:AutocompleteItem,output:_=>({text:`,${_.code},`,caretPosition:"end"})}}})}),jsxs(AutoHeightRow,{children:[jsxs(DescriptionLabel,{children:[jsx(ToastErrorMessage,{children:l}),jsxs(Message,{children:["Enter text directly, or wrap"," ",jsx(Link,{href:"https://docs.qmk.fm/#/keycodes_basic",target:"_blank",children:"Basic Keycodes"})," ","in ","{}"]}),jsxs(Message,{children:["Single tap: ","{KC_XXX}"]}),jsxs(Message,{children:["Chord: ","{KC_XXX, KC_YYY, KC_ZZZ}"]}),jsxs(Message,{children:["Keydown: ","{+KC_XXX}"]}),jsxs(Message,{children:["Keyup: ","{-KC_XXX}"]}),s?jsxs(Message,{children:["Delay (ms): ","{NNNN}"," "]}):"Upgrade firmware to use delays",jsx(Message,{children:"Type ? to search for keycodes"})]}),jsx(Detail,{children:jsx(AccentButton,{disabled:e===i,onClick:u,children:"Save"})})]})]})},ProgressBarContainer=ut.div`
  position: relative;
  margin-top: 10px;
  &:hover {
    & .tooltip {
      transform: scale(1) translateY(0px);
      opacity: 1;
    }
  }
  .tooltip {
    transform: translateY(5px) scale(0.6);
    opacity: 0;
  }
`,ProgressBar=ut.div`
  background: var(--bg_control);
  position: relative;
  padding: 5px;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
  cursor: pointer;
  width: 250px;

  > span {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    background: var(--color_accent);
    height: 10px;
    width: 100%;
    transform: scaleX(0.1);
    transform-origin: left;
    transition: transform 0.4s ease-in-out;
  }
`,MacroTab=ut.span`
  display: inline-flex;
  border: 1px solid;
  line-height: initial;
  border-top: none;
  padding: 8px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  min-width: 38px;
  justify-content: center;
  box-sizing: border-box;
  color: ${e=>e.$selected?"var(--color_accent)":"var(--bg_icon)"};
  cursor: pointer;
  &:hover {
    color: ${e=>e.$selected?"var(--color_accent)":"var(--bg_icon-highlighted)"};
  }
`,TabBar=ut.div`
  display: flex;
  column-gap: 10px;
`,TabContainer=ut.div`
  display: flex;
  margin-bottom: 10px;
  width: 100%;
  max-width: 960px;
`,CenterTabContainer=ut(TabContainer)`
  justify-content: center;
`,printBytesUsed=(e,t)=>{const o=["Bytes","kB","MB","GB"],n=Math.floor(Math.log10(t)/3),r=o[n],s=n===0?1:Math.pow(1e3,n),a=e/s,i=t/s;return`${a.toFixed(n)} / ${i.toFixed(n)} ${r} space used`},BufferSizeUsage=()=>{const e=useAppSelector(i=>i.macros.ast),t=useAppSelector(getMacroBufferSize),o=useAppSelector(getSelectedConnectedDevice),n=useAppSelector(getSelectedKeyboardAPI);if(!o||!n)return null;const{protocol:r}=o,a=getMacroAPI(r,n).rawKeycodeSequencesToMacroBytes(e).length;return jsxs(ProgressBarContainer,{children:[jsx(ProgressBar,{children:jsx("span",{style:{transform:`scaleX(${a/t})`}})}),jsx(ProgressBarTooltip,{children:printBytesUsed(a,t)})]})},MacroDetailPane=e=>{const t=e.macroExpressions[e.selectedMacro]||"",[o,n]=React.useState(!1),r=useAppSelector(d=>d.macros.ast),s=useAppSelector(getIsDelaySupported),[a,i]=reactExports.useState(t);reactExports.useEffect(()=>{i(t)},[t]);const c=reactExports.useCallback(()=>{i(t)},[t]),l=reactExports.useCallback(d=>{d!==void 0?(e.saveMacros(""),i("")):a!==t&&(e.saveMacros(a),i(a))},[a]);return jsxs(Fragment,{children:[jsx(CenterTabContainer,{children:jsxs(TabBar,{children:[jsx(MacroTab,{$selected:!o,onClick:()=>n(!1),children:jsx(FontAwesomeIcon,{icon:faClapperboard})}),jsx(MacroTab,{$selected:o,onClick:()=>n(!0),children:jsx(FontAwesomeIcon,{icon:faCode})})]})}),jsx(BufferSizeUsage,{}),o?jsx(ScriptMode,{macro:t,macroIndex:e.selectedMacro,protocol:e.protocol,isDelaySupported:s,setUnsavedMacro:i,saveMacros:e.saveMacros},e.selectedMacro):jsx(MacroRecorder,{selectedMacro:r[e.selectedMacro],setUnsavedMacro:i,undoMacro:c,saveMacro:l,isDelaySupported:s})]})},MacroPane=ut(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`,Container$a=ut.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 12px;
  padding-top: 0;
`,MenuContainer$2=ut.div`
  padding: 15px 10px 20px 10px;
`,Pane$3=()=>{const e=useAppDispatch(),t=useAppSelector(getSelectedConnectedDevice),o=useAppSelector(getExpressions),n=useAppSelector(getMacroCount),[r,s]=reactExports.useState(0),a=reactExports.useCallback(async c=>{if(!t)return;const l=o.map((d,u)=>u===r?c:d);e(saveMacros(t,l))},[o,saveMacros,e,t,r]),i=reactExports.useMemo(()=>Array(n).fill(0).map((c,l)=>l).map(c=>jsx(SubmenuRow,{$selected:r===c,onClick:()=>s(c),style:{borderWidth:0,textAlign:"center"},children:`M${c}`},c)),[r,n]);return t?jsxs(Fragment,{children:[jsx(SubmenuOverflowCell,{children:jsx(MenuContainer$2,{children:i})}),jsx(OverflowCell,{children:jsx(MacroPane,{children:jsx(Container$a,{children:jsx(MacroDetailPane,{macroExpressions:o,selectedMacro:r,saveMacros:a,protocol:t?t.protocol:-1})})})})]}):null},Icon$3=component$2,Title$3=title$2,Macros=Object.freeze(Object.defineProperty({__proto__:null,Icon:Icon$3,Pane:Pane$3,Title:Title$3},Symbol.toStringTag,{value:"Module"}));function AccentUploadButton(e){const t=e.inputRef||React.useRef();function o(n){e.onLoad(n.target.files),t.current.value=null}return jsxs(AccentButton,{onClick:()=>t.current&&t.current.click(),children:[e.children,jsx("input",{ref:t,type:"file",multiple:e.multiple,accept:"application/json",style:{display:"none"},onChange:o})]})}const deprecatedKeycodes={KC_TILD:"S(KC_GRV)",KC_EXLM:"S(KC_1)",KC_AT:"S(KC_2)",KC_HASH:"S(KC_3)",KC_DLR:"S(KC_4)",KC_PERC:"S(KC_5)",KC_CIRC:"S(KC_6)",KC_AMPR:"S(KC_7)",KC_ASTR:"S(KC_8)",KC_LPRN:"S(KC_9)",KC_RPRN:"S(KC_0)",KC_UNDS:"S(KC_MINS)",KC_PLUS:"S(KC_EQL)",KC_LCBR:"S(KC_LBRC)",KC_RCBR:"S(KC_RBRC)",KC_PIPE:"S(KC_BSLS)",KC_COLN:"S(KC_SCLN)",KC_DQUO:"S(KC_QUOT)",KC_LT:"S(KC_COMM)",KC_GT:"S(KC_DOT)",KC_QUES:"S(KC_SLSH)",SPC_FN1:"LT(1,KC_SPC)",SPC_FN2:"LT(2,KC_SPC)",SPC_FN3:"LT(3,KC_SPC)",MACRO00:"MACRO(0)",MACRO01:"MACRO(1)",MACRO02:"MACRO(2)",MACRO03:"MACRO(3)",MACRO04:"MACRO(4)",MACRO05:"MACRO(5)",MACRO06:"MACRO(6)",MACRO07:"MACRO(7)",MACRO08:"MACRO(8)",MACRO09:"MACRO(9)",MACRO10:"MACRO(10)",MACRO11:"MACRO(11)",MACRO12:"MACRO(12)",MACRO13:"MACRO(13)",MACRO14:"MACRO(14)",MACRO15:"MACRO(15)",USER00:"CUSTOM(0)",USER01:"CUSTOM(1)",USER02:"CUSTOM(2)",USER03:"CUSTOM(3)",USER04:"CUSTOM(4)",USER05:"CUSTOM(5)",USER06:"CUSTOM(6)",USER07:"CUSTOM(7)",USER08:"CUSTOM(8)",USER09:"CUSTOM(9)",USER10:"CUSTOM(10)",USER11:"CUSTOM(11)",USER12:"CUSTOM(12)",USER13:"CUSTOM(13)",USER14:"CUSTOM(14)",USER15:"CUSTOM(15)"},title$1="Save + Load",component$1=()=>jsx(FontAwesomeIcon,{icon:faFloppyDisk}),isViaSaveFile=e=>e&&e.name&&e.layers&&e.vendorProductId,SaveLoadPane=ut(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`,Container$9=ut.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`,Pane$2=()=>{const e=useAppDispatch(),t=useAppSelector(getSelectedDefinition),o=useAppSelector(getSelectedConnectedDevice),n=useAppSelector(getSelectedKeyboardAPI),r=useAppSelector(getSelectedRawLayers),s=useAppSelector(K=>K.macros),a=useAppSelector(getExpressions),{basicKeyToByte:i,byteToKey:c}=useAppSelector(getBasicKeyToByte);if(!t||!o||!n)return null;const[l,d]=reactExports.useState(null),[u,C]=reactExports.useState(null),_=async()=>{const{layouts:K}=t,{keys:g,optionKeys:y}=K,m=[...g,...Object.values(y).flatMap(S=>Object.values(S)).flat()].filter(S=>"ei"in S).map(S=>S.ei);if(m.length>0){const S=Math.max(...m)+1,b=r.length;return await Promise.all(Array(S).fill(0).map((M,T)=>Promise.all(Array(b).fill(0).map((O,v)=>Promise.all([n.getEncoderValue(v,T,!1),n.getEncoderValue(v,T,!0)]).then(P=>P.map(I=>getCodeForByte(I,i,c)||""))))))}else return[]};return jsx(SpanOverflowCell,{children:jsx(SaveLoadPane,{children:jsxs(Container$9,{children:[jsxs(ControlRow,{children:[jsx(Label$1,{children:"Save Current Layout"}),jsx(Detail,{children:jsx(AccentButton,{onClick:async()=>{const{name:K,vendorProductId:g}=t,y=K.replace(/[^a-zA-Z0-9]/g,"_").toLowerCase()+".layout.json";try{const m=await window.showSaveFilePicker({suggestedName:y}),S=await _(),b={name:K,vendorProductId:g,macros:[...a],layers:r.map(O=>O.keymap.map(v=>getCodeForByte(v,i,c)||"")),encoders:S},E=stringify(b),M=new Blob([E],{type:"application/json"}),T=await m.createWritable();await T.write(M),await T.close()}catch{console.log("User cancelled save file request")}},children:"Save"})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Load Saved Layout"}),jsx(Detail,{children:jsx(AccentUploadButton,{onLoad:([K])=>{d(null),C(null);const g=new FileReader;g.onabort=()=>d("File reading was cancelled."),g.onerror=()=>d("Failed to read file."),g.onload=async()=>{const y=JSON.parse(g.result.toString());if(!isViaSaveFile(y)){d("Could not load file: invalid data.");return}if(y.vendorProductId!==t.vendorProductId){d(`Could not import layout. This file was created for a different keyboard: ${y.name}`);return}if(y.layers.findIndex((S,b)=>S.length!==r[b].keymap.length)>-1){d("Could not import layout: incorrect number of keys in one or more layers.");return}if(s.isFeatureSupported&&y.macros){if(y.macros.length!==a.length){d("Could not import layout: incorrect number of macros.");return}e(saveMacros(o,y.macros))}const m=y.layers.map(S=>S.map(b=>getByteForCode(`${deprecatedKeycodes[b]??b}`,i)));await e(saveRawKeymapToDevice(m,o)),y.encoders&&await Promise.all(y.encoders.map((S,b)=>Promise.all(S.map((E,M)=>Promise.all([n.setEncoderValue(M,b,!1,getByteForCode(`${deprecatedKeycodes[E[0]]??E[0]}`,i)),n.setEncoderValue(M,b,!0,getByteForCode(`${deprecatedKeycodes[E[1]]??E[1]}`,i))]))))),C("Successfully updated layout!")},g.readAsBinaryString(K)},children:"Load"})})]}),l?jsx(ErrorMessage,{children:l}):null,u?jsx(SuccessMessage,{children:u}):null]})})})},Icon$2=component$1,Title$2=title$1,SaveLoad=Object.freeze(Object.defineProperty({__proto__:null,Icon:Icon$2,Pane:Pane$2,Title:Title$2},Symbol.toStringTag,{value:"Module"})),SvgIcKeyboard24Px=e=>jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",children:[jsx("path",{d:"M0 0h24v24H0z",fill:"none"}),jsx("path",{d:"M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",fill:"currentColor"})]}),title="Layouts",component=SvgIcKeyboard24Px,LayoutControl=e=>{const{onChange:t,meta:o}=e,{labels:n,selectedOption:r}=o;if(Array.isArray(n)){const[s,...a]=n,i=a.map((c,l)=>({label:c,value:`${l}`}));return jsxs(ControlRow,{children:[jsx(Label$1,{children:s}),jsx(Detail,{children:jsx(AccentSelect,{defaultValue:i[r],options:i,onChange:c=>{c&&t(+c.value)}})})]})}else return jsxs(ControlRow,{children:[jsx(Label$1,{children:n}),jsx(Detail,{children:jsx(AccentSlider,{isChecked:!!r,onChange:s=>t(+s)})})]})},ContainerPane=ut(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`,Container$8=ut.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`,Pane$1=()=>{const e=useAppDispatch(),t=useAppSelector(getSelectedDefinition),o=useAppSelector(getSelectedLayoutOptions);if(!t||!o)return null;const{layouts:n}=t,r=n.labels||[];return jsx(SpanOverflowCell,{children:jsx(ContainerPane,{children:jsx(Container$8,{children:r.map((s,a)=>jsx(LayoutControl,{onChange:i=>e(updateLayoutOption(a,i)),meta:{labels:s,selectedOption:o[a]}},a))})})})},Title$1=title,Icon$1=component,Layouts$1=Object.freeze(Object.defineProperty({__proto__:null,Icon:Icon$1,Pane:Pane$1,Title:Title$1},Symbol.toStringTag,{value:"Module"})),GET_KEYBOARD_VALUE=2,SET_KEYBOARD_VALUE=3,KB_VALUES={ENABLED_ENCODER_MODES:128,OLED_DEFAULT_MODE:129,ENCODER_CUSTOM:130,OLED_MODE:131},getEncoderModes=async e=>{const t=[KB_VALUES.ENABLED_ENCODER_MODES],[,,o]=await e.hidCommand(GET_KEYBOARD_VALUE,t);return o},setEncoderModes=async(e,t)=>{const o=[KB_VALUES.ENABLED_ENCODER_MODES,t];await e.hidCommand(SET_KEYBOARD_VALUE,o)},getDefaultOLED=async e=>{const t=[KB_VALUES.OLED_DEFAULT_MODE],[,,o]=await e.hidCommand(GET_KEYBOARD_VALUE,t);return o},setDefaultOLED=async(e,t)=>{const o=[KB_VALUES.OLED_DEFAULT_MODE,t];await e.hidCommand(SET_KEYBOARD_VALUE,o)},getOLEDMode=async e=>{const t=[KB_VALUES.OLED_MODE],[,,o]=await e.hidCommand(GET_KEYBOARD_VALUE,t);return o},setOLEDMode=async(e,t)=>{const o=[KB_VALUES.OLED_MODE,t];await e.hidCommand(SET_KEYBOARD_VALUE,o)},getCustomEncoderConfig=async(e,t)=>{const o=[KB_VALUES.ENCODER_CUSTOM,t],n=await e.hidCommand(GET_KEYBOARD_VALUE,o),[,,,r,s,a,i,c,l]=n;return[r<<8|s,a<<8|i,c<<8|l]},setCustomEncoderConfig=async(e,t,o,n)=>{const r=(n&65280)>>8,s=n&255,a=[KB_VALUES.ENCODER_CUSTOM,t,o,r,s];await e.hidCommand(SET_KEYBOARD_VALUE,a)},MODES={ENC_MODE_VOLUME:0,ENC_MODE_MEDIA:1,ENC_MODE_SCROLL:2,ENC_MODE_BRIGHTNESS:3,ENC_MODE_BACKLIGHT:4,ENC_MODE_CUSTOM0:5,ENC_MODE_CUSTOM1:6,ENC_MODE_CUSTOM2:7},MODE_LABELS={ENC_MODE_VOLUME:"Volume",ENC_MODE_MEDIA:"Media",ENC_MODE_SCROLL:"Scroll",ENC_MODE_BRIGHTNESS:"Brightness",ENC_MODE_BACKLIGHT:"Backlight",ENC_MODE_CUSTOM0:"Custom 0",ENC_MODE_CUSTOM1:"Custom 1",ENC_MODE_CUSTOM2:"Custom 2"},CenteredColumnDiv=ut.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`,ColumnDiv=ut.div`
  display: flex;
  flex-direction: column;
`;class EncoderModeToggle extends React.Component{constructor(){super(...arguments);x(this,"handleInputChange",o=>{const{enabledModes:n,onChange:r}=this.props,{target:{checked:s,name:a}}=o,i=1<<MODES[a],c=s?n|i:n&~i;r(c)});x(this,"isChecked",o=>(1<<o&this.props.enabledModes)>0)}render(){return jsxs(CenteredColumnDiv,{children:[jsx("h3",{children:"Enabled Encoder Modes:"}),jsx("p",{children:"Only the selected encoder modes will be available on the keyboard"}),jsx(ColumnDiv,{children:Object.entries(MODES).map(([o,n])=>jsxs("label",{htmlFor:MODE_LABELS[o],children:[jsx("input",{name:o,id:MODE_LABELS[o],type:"checkbox",checked:this.isChecked(n),onChange:this.handleInputChange},n),MODE_LABELS[o]]},n))})]})}}const NormalInput=ut.input`
  border: none;
  border-bottom: 1px solid var(--bg_control);
  color: var(--color_accent);
  background: var(--bg_menu);
  transition: all 0.4s ease-out;
  font-size: 18px;
  margin-bottom: 25px;
  height: 30px;
  padding: 0 5px;
  &:focus {
    outline: none;
    color: var(--color_accent);
    border-color: var(--color_accent);
  }
  &::placeholder {
    color: var(--bg_control);
  }
`,ErrorInput=ut(NormalInput)`
  border-color: #d15e5e;
  color: #d15e5e;
`;class KeycodeTextInput extends React.Component{constructor(o){super(o);x(this,"handleChange",o=>{const n=o.target.value;this.setState({currentValue:n})});x(this,"handleBlur",o=>{const{onBlur:n,basicKeyToByte:r}=this.props,{lastDefault:s}=this.state,a=o.target.value.trim().toUpperCase(),i=advancedStringToKeycode(a,r);Object.keys(r).includes(a)?(s!==r[a]&&n(r[a]),this.setState({isError:!1})):i!==0?(s!==i&&n(i),this.setState({isError:!1})):new RegExp(/^0x[0-9A-Fa-f]{1,4}$/g).test(o.target.value.trim())?(n(parseInt(o.target.value.trim(),16)),this.setState({isError:!1})):this.setState({isError:!0})});const{defaultValue:n,basicKeyToByte:r,byteToKey:s}=o;let a=anyKeycodeToString(n,r,s);this.state={lastDefault:n,defaultValueAsString:a,currentParsed:n,currentValue:a,isError:!1}}static getDerivedStateFromProps(o,n){return n.lastDefault!==o.defaultValue&&n.currentParsed!==o.defaultValue?{...n,currentValue:anyKeycodeToString(o.defaultValue,o.basicKeyToByte,o.byteToKey),currentParsed:o.defaultValue,lastDefault:o.defaultValue}:n}render(){const{currentValue:o,isError:n}=this.state;return jsx(n?ErrorInput:NormalInput,{type:"text",placeholder:this.props.defaultValue?this.state.defaultValueAsString:"KC_NO, 0xFF, etc.",value:o,onChange:this.handleChange,onBlur:this.handleBlur,className:this.props.className})}}const RowDiv=ut.div`
  display: flex;
  flex-direction: row;
  margin-top: 4px;
`,LabelText$1=ut.span`
  font-weight: 650;
  margin-right: 8px;
  width: 80px;
`,KeyInput=ut(KeycodeTextInput)`
  width: 64px;
  margin-right: 8px;
`,EncoderCustomConfig=e=>{const{encoderIdx:t,onChange:o,title:n,behaviors:[r,s,a]}=e,{basicKeyToByte:i,byteToKey:c}=useAppSelector(getBasicKeyToByte),l=(d,u)=>{o(t,u,d)};return jsxs(RowDiv,{children:[jsx(LabelText$1,{children:n}),jsx(KeyInput,{defaultValue:r,basicKeyToByte:i,byteToKey:c,onBlur:d=>l(d,0)}),jsx(KeyInput,{defaultValue:s,basicKeyToByte:i,byteToKey:c,onBlur:d=>l(d,1)}),jsx(KeyInput,{defaultValue:a,basicKeyToByte:i,byteToKey:c,onBlur:d=>l(d,2)})]})},MenuContainer$1=ut.div`
  display: flex;
  color: #717070;
  padding: 24px;
  font-family: GothamRounded;
  h3 {
    margin: 4px 0;
  }
  p {
    margin: 4px 0 8px 0;
    width: 288px;
    font-size: 13px;
    text-align: center;
  }
`,SectionContainer=ut.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
`,OLEDSelectContainer=ut.div`
  width: 156px;
  margin-bottom: 12px;
`,CustomEncoderContainer=ut.div`
  padding-left: 112px;
  display: flex;
  flex-direction: row;
`,LabelText=ut.span`
  font-weight: 650;
  margin-right: 8px;
  width: 64px;
`,OLED_OPTIONS=[{value:0,label:"Default"},{value:1,label:"Time"},{value:2,label:"Off"}],SatisfactionMenu=()=>{const e=useAppSelector(getSelectedKeyboardAPI);return e?jsx(BaseSatisfactionMenu,{api:e}):null};class BaseSatisfactionMenu extends reactExports.Component{constructor(){super(...arguments);x(this,"state",{enabledModes:31,defaultOLEDMode:0,currOLEDMode:0,encoderBehaviors:[[0,0,0],[0,0,0],[0,0,0]]});x(this,"fetchDataAndSet",async()=>{const{api:o}=this.props,n=[getEncoderModes(o),getDefaultOLED(o),getOLEDMode(o),getCustomEncoderConfig(o,0),getCustomEncoderConfig(o,1),getCustomEncoderConfig(o,2)],[r,s,a,i,c,l]=await Promise.all(n);this.setState({enabledModes:r,defaultOLEDMode:s,currOLEDMode:a,encoderBehaviors:[i,c,l]})});x(this,"onEncoderModeChange",o=>{const{api:n}=this.props,{enabledModes:r}=this.state;r!==o&&(this.setState({enabledModes:o}),setEncoderModes(n,o))});x(this,"onEncoderCustomConfigChange",(o,n,r)=>{const{api:s}=this.props,a=[...this.state.encoderBehaviors];a[o][n]=r,this.setState({encoderBehaviors:a}),setCustomEncoderConfig(s,o,n,r)});x(this,"onOLEDDefaultChange",o=>{const{value:n}=o,{api:r}=this.props,{defaultOLEDMode:s}=this.state;s!==n&&(this.setState({defaultOLEDMode:n}),setDefaultOLED(r,n))});x(this,"onOLEDChange",o=>{const{value:n}=o,{api:r}=this.props,{currOLEDMode:s}=this.state;s!==n&&(this.setState({currOLEDMode:n}),setOLEDMode(r,n))})}componentDidMount(){this.fetchDataAndSet()}render(){const{api:o}=this.props,{enabledModes:n,defaultOLEDMode:r,currOLEDMode:s,encoderBehaviors:a}=this.state;return o?jsxs(MenuContainer$1,{children:[jsx(SectionContainer,{children:jsx(EncoderModeToggle,{onChange:this.onEncoderModeChange,enabledModes:n})}),jsxs(SectionContainer,{children:[jsx("h3",{children:"Default OLED Mode:"}),jsx("p",{children:"This is the OLED mode that will be selected by default when you plug in your keyboard."}),jsx(OLEDSelectContainer,{children:jsx(StateManagedSelect$1,{value:OLED_OPTIONS.find(i=>i.value===r),onChange:this.onOLEDDefaultChange,options:OLED_OPTIONS})}),jsx("h3",{children:"Current OLED Mode:"}),jsxs("p",{children:["Change your ","keyboard's"," current OLED mode"]}),jsx(OLEDSelectContainer,{children:jsx(StateManagedSelect$1,{value:OLED_OPTIONS.find(i=>i.value===s),onChange:this.onOLEDChange,options:OLED_OPTIONS,menuPlacement:"top"})})]}),jsxs(SectionContainer,{children:[jsx("h3",{children:"Custom Encoder Configuration:"}),jsx("p",{children:"Configure the behavior of encoder custom modes"}),jsxs(CustomEncoderContainer,{children:[jsx(LabelText,{children:"CW"}),jsx(LabelText,{children:"CCW"}),jsx(LabelText,{children:"Press"})]}),jsx(EncoderCustomConfig,{title:"Custom 0",encoderIdx:0,behaviors:a[0],onChange:this.onEncoderCustomConfigChange}),jsx(EncoderCustomConfig,{title:"Custom 1",encoderIdx:1,behaviors:a[1],onChange:this.onEncoderCustomConfigChange}),jsx(EncoderCustomConfig,{title:"Custom 2",encoderIdx:2,behaviors:a[2],onChange:this.onEncoderCustomConfigChange})]})]}):null}}const size=16.187,SvgIcMemory24Px=e=>jsx("svg",{width:size,height:size,...e,children:jsx("path",{d:"M10.791 5.4H5.4v5.4h5.4zM8.991 9h-1.8V7.2h1.8zm7.194-1.8V5.4h-1.8V3.6a1.8 1.8 0 00-1.8-1.8h-1.8V0h-1.8v1.8h-1.8V0H5.4v1.8H3.6a1.8 1.8 0 00-1.8 1.8v1.8H0v1.8h1.8V9H0v1.8h1.8v1.8a1.8 1.8 0 001.8 1.8h1.8v1.8h1.8v-1.8H9v1.8h1.8v-1.8h1.8a1.8 1.8 0 001.8-1.8v-1.8h1.8V9h-1.8V7.2zm-3.6 5.4H3.6v-9h8.99z",fill:"currentColor"})}),Pane=SatisfactionMenu,Title="Custom Features",Icon=SvgIcMemory24Px,RotaryEncoder=Object.freeze(Object.defineProperty({__proto__:null,Icon,Pane,Title},Symbol.toStringTag,{value:"Module"})),Container$7=ut.div`
  position: absolute;
  left: 15px;
  font-weight: 400;
  top: 10px;
`,Label=ut.label`
  font-size: 20px;
  text-transform: uppercase;
  color: var(--color_label-highlighted);
  margin-right: 6px;
`,LayerButton=ut.button`
  outline: none;
  font-variant-numeric: tabular-nums;
  border: none;
  background: ${e=>e.$selected?"var(--color_accent)":"transparent"};
  color: ${e=>e.$selected?"var(--color_inside-accent)":"var(--color_label-highlighted)"};
  cursor: pointer;
  font-size: 20px;
  font-weight: 400;
  &:hover {
    border: none;
    background: ${e=>e.$selected?"auto":"var(--bg_menu)"};
    color: ${e=>e.$selected?"auto":"var(--color_label-highlighted)"};
  }
`,LayerControl=()=>{const e=useDispatch(),t=useAppSelector(getNumberOfLayers),o=useAppSelector(getSelectedLayerIndex),n=reactExports.useMemo(()=>new Array(t).fill(0).map((r,s)=>s).map(r=>jsx(LayerButton,{$selected:r===o,onClick:()=>e(setLayer(r)),children:r},r)),[t,o]);return jsxs(Container$7,{children:[jsx(Label,{children:"Layer"}),n]})},createRetry=(e,t)=>{const o={retriesLeft:e,timeoutWait:t};return{retry:a=>{o.retriesLeft=o.retriesLeft-1,o.retriesLeft<=0?console.error("Exhausted all retries"):(console.log(`Retrying after waiting ${o.timeoutWait}`),setTimeout(a,o.timeoutWait),o.timeoutWait=o.timeoutWait*2)},clear:()=>{console.log("Clearing retries back to:",e),o.retriesLeft=e,o.timeoutWait=t},retriesLeft:()=>o.retriesLeft>=1}},selectConnectedDeviceRetry=createRetry(8,100),selectConnectedDeviceByPath=e=>async(t,o)=>{await t(reloadConnectedDevices());const n=getConnectedDevices(o())[e];n&&t(selectConnectedDevice(n))},selectConnectedDevice=e=>async t=>{const o=extractDeviceInfo(e);try{t(selectDevice(e)),await t(loadMacros(e)),await t(loadLayoutOptions());const{protocol:n}=e;try{n<11?await t(updateLightingData(e)):n>=11&&await t(updateV3MenuData(e))}catch{t(logAppError({message:"Loading lighting/menu data failed",deviceInfo:o}))}await t(loadKeymapFromDevice(e)),selectConnectedDeviceRetry.clear()}catch(n){selectConnectedDeviceRetry.retriesLeft()?(t(logAppError({message:"Loading device failed - retrying",deviceInfo:o})),selectConnectedDeviceRetry.retry(()=>{t(selectConnectedDevice(e))})):(t(logAppError({message:"All retries failed for attempting connection with device",deviceInfo:o})),console.log("Hard resetting device store:",n),t(clearAllDevices()))}},reloadConnectedDevices=()=>async(e,t)=>{const o=t(),n=getSelectedDevicePath(o),r=getForceAuthorize(o),s=getSupportedIds(o),a=await getRecognisedDevices(s,r),i=await Promise.all(a.map(_=>new KeyboardAPI(_.path).getProtocolVersion())),c=a.filter((_,h)=>i[h]===-1);c.length&&c.forEach(_=>{const h=extractDeviceInfo(_);e(logAppError({message:"Received invalid protocol version from device",deviceInfo:h}))});const l=a.filter((_,h)=>i[h]!==-1).map((_,h)=>{const{path:p,productId:K,vendorId:g,productName:y}=_,m=i[h];return{path:p,productId:K,vendorId:g,protocol:m,productName:y,hasResolvedDefinition:!1,requiredDefinitionVersion:m>=11?"v3":"v2",vendorProductId:getVendorProductId(_.vendorId,_.productId)}});await e(reloadDefinitions(l));const d=getDefinitions(t()),u=l.filter((_,h)=>isAuthorizedDeviceConnected(_,d)).reduce((_,h,p)=>(_[h.path]={...h,hasResolvedDefinition:!0},_),{});l.filter(_=>!isAuthorizedDeviceConnected(_,d)).forEach(tryForgetDevice);const C=Object.entries(u);if(C.forEach(([_,h])=>{console.info("Setting connected device:",h.protocol,_,h)}),e(updateConnectedDevices(u)),(!n||!u[n])&&C.length>0){const _=C[0][1];e(selectConnectedDevice(_))}else C.length===0&&(e(selectDevice(null)),e(setForceAuthorize(!0)))},loadSupportedIds=()=>async e=>{await syncStore(),e(updateSupportedIds(getSupportedIdsFromStore())),await e(updateDefinitions(getDefinitionsFromStore())),e(loadStoredCustomDefinitions()),e(reloadConnectedDevices())},isElectron=/Electron/.test(navigator.userAgent),Container$6=ut.div`
  position: absolute;
  right: 15px;
  top: 0px;
  font-size: 18px;
  pointer-events: none;
  font-weight: 400;
`,KeyboardTitle=ut.label`
  pointer-events: all;
  display: inline-block;
  background: var(--color_accent);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  font-size: 18px;
  text-transform: uppercase;
  color: var(--color_inside-accent);
  padding: 1px 10px;
  margin-right: 10px;
  border: solid 1px var(--bg_control);
  border-top: none;
  cursor: pointer;
  transition: all 0.1s ease-out;
  &:hover {
    filter: brightness(0.7);
  }
`,KeyboardList=ut.ul`
  padding: 0;
  border: 1px solid var(--bg_control);
  width: 160px;
  border-radius: 6px;
  background-color: var(--bg_menu);
  margin: 0;
  margin-top: 5px;
  right: 10px;
  position: absolute;
  pointer-events: ${e=>e.$show?"all":"none"};
  transition: all 0.2s ease-out;
  z-index: 11;
  opacity: ${e=>e.$show?1:0};
  overflow: hidden;
  transform: ${e=>e.$show?0:"translateY(-5px)"};
`,KeyboardButton=ut.button`
  display: block;
  text-align: center;
  outline: none;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  border: none;
  background: ${e=>e.$selected?"var(--bg_icon-highlighted)":"transparent"};
  color: ${e=>e.$selected?"var(--color_icon_highlighted)":"var(--color_label-highlighted)"};
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  text-transform: uppercase;
  padding: 5px 10px;
  &:hover {
    border: none;
    background: ${e=>e.$selected?"var(--bg_icon-highlighted)":"var(--bg_control)"};
    color: ${e=>e.$selected?"var(--color_control-highlighted)":"var(--color_label-highlighted)"};
  }
`,ClickCover=ut.div`
  position: fixed;
  z-index: 10;
  pointer-events: all;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.4;
  background: rgba(0, 0, 0, 0.75);
`,KeyboardSelectors=e=>{const t=async()=>{const o=await HID.requestDevice();o&&e.selectKeyboard(o.__path)};return jsxs(Fragment,{children:[e.show&&jsx(ClickCover,{onClick:e.onClickOut}),jsxs(KeyboardList,{$show:e.show,children:[e.keyboards.map(([o,n])=>jsx(KeyboardButton,{$selected:o===e.selectedPath,onClick:()=>e.selectKeyboard(o),children:n.name},o)),!isElectron&&jsxs(KeyboardButton,{onClick:t,children:["Authorize New",jsx(FontAwesomeIcon,{icon:faPlus,style:{marginLeft:"10px"}})]})]})]})},Badge=()=>{const e=useAppDispatch(),t=useAppSelector(getDefinitions),o=useAppSelector(getSelectedDefinition),n=useAppSelector(getConnectedDevices),r=useAppSelector(getSelectedDevicePath),[s,a]=reactExports.useState(!1),i=reactExports.useMemo(()=>Object.entries(n).map(([c,l])=>[c,t[l.vendorProductId]&&t[l.vendorProductId][l.requiredDefinitionVersion]]).filter(c=>c[1]),[n,t]);return!o||!r?null:jsx(Fragment,{children:jsxs(Container$6,{children:[jsxs(KeyboardTitle,{onClick:()=>a(!s),children:[o.name,jsx(FontAwesomeIcon,{icon:faAngleDown,style:{transform:s?"rotate(180deg)":"",transition:"transform 0.2s ease-out",marginLeft:"5px"}})]}),jsx(KeyboardSelectors,{show:s,selectedPath:r,keyboards:i,onClickOut:()=>a(!1),selectKeyboard:c=>{e(selectConnectedDeviceByPath(c)),a(!1)}})]})})},MenuContainer=ut.div`
  padding: 15px 10px 20px 10px;
`;[...makeCustomMenus([])];function getCustomPanes(e){return e.find(t=>t===dist.CustomFeaturesV2.RotaryEncoder)?[RotaryEncoder]:[]}const getRowsForKeyboard=()=>{const e=useAppSelector(getIsMacroFeatureSupported),t=useAppSelector(getV3MenuComponents),o=useAppSelector(getSelectedDefinition),n=useAppSelector(getNumberOfLayers);return o?dist.isVIADefinitionV2(o)?getRowsForKeyboardV2(o,e,n):dist.isVIADefinitionV3(o)?[...filterInferredRows(o,e,n,[Keycode$1,Layouts$1,Macros,SaveLoad]),...t]:[]:[]},filterInferredRows=(e,t,o,n)=>{const{layouts:r}=e;let s=[];return r.optionKeys&&Object.entries(r.optionKeys).length!==0||(s=[...s,Layouts$1]),o===0&&(s=[...s,Keycode$1,SaveLoad]),t||(s=[...s,Macros]),n.filter(i=>!s.includes(i))},getRowsForKeyboardV2=(e,t,o)=>{let n=[Keycode$1,Layouts$1,Macros,SaveLoad];if(dist.isVIADefinitionV2(e)){const{lighting:r,customFeatures:s}=e,{supportedLightingValues:a}=dist.getLightingDefinition(r);a.length!==0&&(n=[...n,Lighting]),s&&(n=[...n,...getCustomPanes(s)])}return filterInferredRows(e,t,o,n)},Loader=e=>{const{loadProgress:t,selectedDefinition:o}=e,n=useAppDispatch(),r=useAppSelector(getSelectedTheme),s=useAppSelector(getConnectedDevices),a=useAppSelector(getSupportedIds),i=!Object.values(a).length,c=!Object.values(s).length,[l,d]=reactExports.useState(!1);return reactExports.useEffect(()=>{const u=setTimeout(()=>{o||d(!0)},3e3);return()=>clearTimeout(u)},[o]),jsxs(LoaderPane,{children:[jsx(ChippyLoader,{theme:r,progress:t||null}),(l||c)&&!i&&!isElectron?jsxs(AccentButtonLarge,{onClick:()=>n(reloadConnectedDevices()),children:["Authorize device",jsx(FontAwesomeIcon,{style:{marginLeft:"10px"},icon:faPlus})]}):jsx(LoadingText$1,{isSearching:!o})]})},LoaderPane=ut(CenterPane)`
  display: flex;
  align-items: center;
  justify-content: center;
  row-gap: 50px;
  position: absolute;
  bottom: 50px;
  top: 50px;
  left: 0;
  right: 0;
  z-index: 4;
`,ConfigurePane=()=>{const e=useAppSelector(getSelectedDefinition),t=useAppSelector(getLoadProgress),o=useAppSelector(getRenderMode);return!e||t!==1?o==="2D"?jsx(Loader,{selectedDefinition:e||null,loadProgress:t}):null:jsx(ConfigureBasePane,{children:jsx(ConfigureGrid,{})})},ConfigureGrid=()=>{var a,i;const e=useDispatch(),[t,o]=reactExports.useState(0),n=getRowsForKeyboard(),r=(a=n[t])==null?void 0:a.Pane,s=(i=n[t])==null?void 0:i.Title;return reactExports.useEffect(()=>{e(setConfigureKeyboardIsSelectable(s==="Keymap"))},[s]),jsxs(Fragment,{children:[jsx(ConfigureFlexCell,{onClick:c=>{c.target.nodeName!=="CANVAS"&&e(clearSelectedKey())},style:{pointerEvents:"none",position:"absolute",top:50,left:0,right:0},children:jsxs("div",{style:{pointerEvents:"all"},children:[jsx(LayerControl,{}),jsx(Badge,{})]})}),jsxs(Grid,{style:{pointerEvents:"none"},children:[jsx(MenuCell,{style:{pointerEvents:"all"},children:jsx(MenuContainer,{children:(n||[]).map(({Icon:c,Title:l},d)=>jsx(Row,{onClick:u=>o(d),$selected:t===d,children:jsxs(IconContainer,{children:[jsx(c,{}),jsx(MenuTooltip,{children:l})]})},d))})}),r&&jsx(r,{})]})]})};function Layouts({definition:e,onLayoutChange:t,RowComponent:o=IndentedControlRow}){const n=useAppSelector(getDesignSelectedOptionKeys),r=useDispatch();if(React.useEffect(()=>{r(updateSelectedOptionKeys([]))},[e]),React.useEffect(()=>{t(n)},[n]),!e.layouts.labels)return null;const s=e.layouts.labels.map((a,i)=>{const c=e.layouts.optionKeys[i];if(Array.isArray(a)){const l=a[0],d=a.slice(1),u=d.map((C,_)=>({label:C,value:c[_]}));return jsxs(o,{children:[jsx(Label$1,{children:l}),jsx(Detail,{children:jsx(AccentSelect,{onChange:C=>{if(C&&C.label){const _=d.indexOf(C.label),h=Array.from(n).map(p=>p||0);h[i]=_,r(updateSelectedOptionKeys(h))}},value:n[i]?u[n[i]]:u[0],options:u})})]},`${i}-${l}`)}return typeof a=="string"?jsxs(o,{children:[jsx(Label$1,{children:a}),jsx(Detail,{children:jsx(AccentSlider,{isChecked:!!n[i],onChange:l=>{const d=Array.from(n).map(u=>u||0);d[i]=Number(l),r(updateSelectedOptionKeys(d))}})})]},`${i}-${a}`):null});return jsx(Fragment,{children:s})}const Container$5=ut.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`,ControlGroup=ut.div`
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  width: 100%;

  &:last-child {
    padding-bottom: 0;
  }
`,ControlGroupHeader=ut.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  margin-bottom: 0.5rem;
`,TestControls=()=>{const[e,t]=reactExports.useState(!0),[o,n]=reactExports.useState(0),[r,s]=reactExports.useState([0,0]),[a,i]=reactExports.useState(0),[c,l]=reactExports.useState(0),{basicKeyToByte:d,byteToKey:u}=useAppSelector(getBasicKeyToByte),C=useAppSelector(getSelected256PaletteColor),_=useDispatch(),h=[{label:"Option 1",value:"0"},{label:"Option 2",value:"1"}];return jsxs(ControlGroup,{children:[jsx(ControlGroupHeader,{children:"Controls"}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Button"}),jsx(Detail,{children:jsx(AccentButton,{children:"Click"})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Disabled Button"}),jsx(Detail,{children:jsx(AccentButton,{disabled:!0,children:"Disabled"})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Text Input"}),jsx(Detail,{children:jsx(TextInput,{})})]}),jsxs(ControlRow,{children:[jsxs(Label$1,{children:[c," / ",anyKeycodeToString(c,d,u)]}),jsx(Detail,{children:jsx(PelpiKeycodeInput,{value:c,setValue:l,meta:{}})})]}),jsxs(ControlRow,{children:[jsxs(Label$1,{children:[r[0],", ",r[1]]}),jsx(Detail,{children:jsx(ArrayColorPicker,{color:r,setColor:(p,K)=>s([p,K])})})]}),jsxs(ControlRow,{children:[jsxs(Label$1,{children:[C[0],", ",C[1]]}),jsx(Detail,{children:jsx(ColorPalettePicker,{color:C,setColor:(p,K)=>_(setSelectedPaletteColor([p,K]))})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:o}),jsx(Detail,{children:jsx(AccentRange,{max:100,min:0,defaultValue:o,onChange:n})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:+e}),jsx(Detail,{children:jsx(AccentSlider,{isChecked:e,onChange:t})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:+a}),jsx(Detail,{children:jsx(AccentSelect,{defaultValue:h[a],options:h,onChange:p=>{p&&i(+p.value)}})})]}),jsx(MacroRecorder,{selectedMacro:[[RawKeycodeSequenceAction.Delay,4]],setUnsavedMacro:p=>p,undoMacro:()=>null,saveMacro:()=>null,isDelaySupported:!0}),jsx(MacroRecorder,{setUnsavedMacro:p=>p,undoMacro:()=>null,saveMacro:()=>null,isDelaySupported:!0})]})},Debug=()=>{const e=useAppSelector(getSelectedKeyboardAPI),t=useAppSelector(getConnectedDevices),o=Object.entries(useAppSelector(getDefinitions)).flatMap(([p,K])=>[[p,K.v2],[p,K.v3]]).filter(([p,K])=>K!==void 0),n=Object.entries(useAppSelector(getBaseDefinitions)).flatMap(([p,K])=>[[p,K.v2],[p,K.v3]]).filter(([p,K])=>K!==void 0),r=Object.entries(useAppSelector(getCustomDefinitions)).flatMap(([p,K])=>[[p,K.v2],[p,K.v3]]).filter(([p,K])=>K!==void 0),[s,a]=reactExports.useState(0),[i,c]=reactExports.useState([]),[l,d]=reactExports.useState(0),[u,C]=reactExports.useState(!1),_=o.map(([,p],K)=>({label:p.name,value:`${K}`})),h=o[s];return jsx(Pane$9,{children:jsx(OverflowCell,{children:jsxs(Container$5,{children:[jsxs(ControlGroup,{children:[jsx(ControlGroupHeader,{children:"Key Testing"}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Show Matrix"}),jsx(Detail,{children:jsx(AccentSlider,{isChecked:u,onChange:p=>C(p)})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Set next key"}),jsx(Detail,{children:jsx(AccentButton,{onClick:()=>{const{keys:p,optionKeys:K}=h[1].layouts,g=K?Object.entries(K).flatMap(([m,S])=>S[0]):[],y=[...p,...g];l!==void 0&&d(getNextKey(l,y)||0)},children:"Next"})})]})]}),_&&jsxs(ControlGroup,{children:[jsx(ControlGroupHeader,{children:"Layout Testing"}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Dummy Keyboard"}),jsx(Detail,{children:jsx(AccentSelect,{onChange:p=>p&&a(+p.value),defaultValue:_[0],options:_})})]})]}),h&&jsx(Layouts,{definition:h[1],onLayoutChange:p=>{c(p)}}),e&&jsxs(ControlGroup,{children:[jsx(ControlGroupHeader,{children:"Connected Device Debugging"}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"EEPROM Reset"}),jsx(Detail,{children:jsx(AccentButton,{onClick:()=>e.resetEEPROM(),children:"Reset"})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Bootloader Jump"}),jsx(Detail,{children:jsx(AccentButton,{onClick:()=>e.jumpToBootloader(),children:"Jump"})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Clear all macros"}),jsx(Detail,{children:jsx(AccentButton,{onClick:()=>e.resetMacros(),children:"Clear"})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Benchmark Switch State Query Speed"}),jsx(Detail,{children:jsx(AccentButton,{onClick:async()=>{const p=performance.now();await Array(1e3).fill(0).map(K=>e.getKeyboardValue(KeyboardValue.SWITCH_MATRIX_STATE,[],20)),console.info("1000 commands in ",performance.now()-p,"ms")},children:"Benchmark"})})]})]}),jsxs(ControlGroup,{children:[jsx(ControlGroupHeader,{children:"Device IDs"}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Connected Devices"}),jsxs(Detail,{children:[Object.values(t).length," Devices"]})]}),Object.values(t).map(p=>{const K=o.find(([g])=>g===p.vendorProductId.toString());return K?jsxs(IndentedControlRow,{children:[jsx(SubLabel,{children:K[1].name}),jsxs(Detail,{children:["0x",p.vendorProductId.toString(16).toUpperCase()]})]},p.path):null}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Local definitions"}),jsxs(Detail,{children:[Object.values(r).length," Definitions"]})]}),Object.values(r).map(([p,K],g)=>jsxs(IndentedControlRow,{children:[jsx(SubLabel,{children:K.name}),jsxs(Detail,{children:["0x",parseInt(p).toString(16).toUpperCase()]})]},g)),jsx(ControlRow,{children:jsxs("details",{children:[jsxs("summary",{children:[jsx(Label$1,{children:"Remote definitions"}),jsxs(Detail,{children:[Object.values(n).length," Definitions"]})]}),Object.values(n).map(([p,K],g)=>jsxs(IndentedControlRow,{children:[jsx(SubLabel,{children:K.name}),jsxs(Detail,{children:["0x",parseInt(p).toString(16).toUpperCase()]})]},g))]})})]}),jsx(TestControls,{})]})})})},MessageDialogContainer=ut.dialog`
  padding: 0;
  border-width: 0;

  background: transparent;
  &::backdrop {
    background: rgba(0, 0, 0, 0.75);
  }

  & > div {
    transition: transform 0.2s ease-out;
    transform: translateY(-20px);
  }

  &[open] > div {
    transform: translateY(0px);
  }
`,Controls=ut.div`
  display: flex;
  justify-content: center;
  align-items: center;
`,MessageDialog=e=>{const t=reactExports.useRef(null),o=reactExports.useCallback(()=>{t.current&&t.current.close(),e.onClose&&e.onClose()},[t.current,e.onClose]);return reactExports.useEffect(()=>(t.current&&(e.isOpen?t.current.showModal():t.current.close()),()=>{o()}),[e.isOpen]),jsx(MessageDialogContainer,{ref:t,children:jsxs(ModalContainer,{children:[jsx(PromptText,{children:e.children}),jsx(Controls,{children:jsx(AccentButton,{onClick:o,children:"Confirm"})})]})})};let designWarningSeen=Number(localStorage.getItem("designWarningSeen")||0),hideDesignWarning=sessionStorage.getItem("hideDesignWarning")||designWarningSeen>4;const DesignErrorMessage=ut(ErrorMessage)`
  margin: 0;
  font-style: italic;
`,Container$4=ut.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`,DesignPane=ut(Pane$9)`
  display: grid;
  max-width: 100vw;
  grid-template-columns: 100vw;
  grid-template-rows: min-content;
`,UploadIcon=ut.div`
  height: 200px;
  width: 50%;
  cursor: pointer;
  max-width: 560px;
  border-radius: 6px;
  margin: 50px 10px;
  animation-duration: 1.5s;
  animation-name: border-glow;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    color: transparent;
    stroke-width: 8px;
    animation-duration: 1.5s;
    animation-name: text-glow;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: ease-in-out;
    font-size: 100px;
  }
`,makeReaderPromise=e=>new Promise((t,o)=>{const n=new FileReader;n.onload=()=>{if(!n.result)return o();t([e.name,n.result.toString()])},n.onerror=o,n.onabort=o,n.readAsBinaryString(e)}),isVIADefinition=e=>dist.isVIADefinitionV2(e)||dist.isVIADefinitionV3(e);function importDefinitions(e,t,o,n){Promise.all(e.map(makeReaderPromise)).then(r=>{let s=[];n([]);const a=r.map(([i,c])=>{if(s.length>0)return null;try{const l=JSON.parse(c.toString());if(t==="v2"?dist.isKeyboardDefinitionV2(l)||dist.isVIADefinitionV2(l):dist.isKeyboardDefinitionV3(l)||dist.isVIADefinitionV3(l))return t==="v2"?dist.isVIADefinitionV2(l)?l:dist.keyboardDefinitionV2ToVIADefinitionV2(l):dist.isVIADefinitionV3(l)?l:dist.keyboardDefinitionV3ToVIADefinitionV3(l);s=(t==="v2"?dist.isKeyboardDefinitionV2.errors||dist.isVIADefinitionV2.errors||[]:dist.isKeyboardDefinitionV3.errors||dist.isVIADefinitionV3.errors||[]).map(u=>`${i} ${u.dataPath?u.dataPath+": ":"Object: "}${u.message}`)}catch(l){l.name?s.push(`${l.name}: ${l.message}`):s.push(`${l}`)}}).filter(isVIADefinition);s.length?n(s):(o(loadCustomDefinitions({definitions:a,version:t})),o(storeCustomDefinitions({definitions:a,version:t})),o(ensureSupportedIds({productIds:a.map(i=>i.vendorProductId),version:t})),o(selectDevice(null)),o(reloadConnectedDevices()))})}function onDrop(e,t,o,n){e.preventDefault();const{dataTransfer:r}=e;if(r!=null&&r.items){const s=Array.from(r.items).filter(a=>a.kind==="file"&&a.type==="application/json").map(a=>a.getAsFile()).filter(a=>a!==null);s.length&&importDefinitions(s,t,o,n)}}const DesignTab=()=>{const e=useDispatch(),t=Object.values(useAppSelector(getCustomDefinitions)),o=useAppSelector(getDesignDefinitionVersion),n=useAppSelector(getSelectedDefinitionIndex),r=useAppSelector(getShowMatrix),[s,a]=reactExports.useState([]),i=reactExports.useMemo(()=>t.filter(C=>C[o]),[t,o]),c=i.map((C,_)=>({label:C[o].name,value:_.toString()})),l=reactExports.useRef(null),d=i[n]&&i[n][o],u=reactExports.useRef();return jsxs(DesignPane,{onDragOver:C=>{C.dataTransfer.effectAllowed="copyMove",C.dataTransfer.dropEffect="none",C.preventDefault(),C.stopPropagation()},children:[jsx(MessageDialog,{isOpen:!hideDesignWarning,onClose:()=>{sessionStorage.setItem("hideDesignWarning","1"),hideDesignWarning="1",designWarningSeen=designWarningSeen+1,localStorage.setItem("designWarningSeen",`${designWarningSeen}`)},children:"This feature is intended for development purposes. If your keyboard is not recognized automatically by VIA, please contact your keyboard's manufacturer or vendor."}),jsx(SinglePaneFlexCell,{ref:l,children:!d&&jsx(UploadIcon,{onClick:()=>{u.current&&u.current.click()},onDrop:C=>onDrop(C,o,e,a),onDragOver:C=>{C.dataTransfer.effectAllowed="copyMove",C.dataTransfer.dropEffect="copy",C.preventDefault(),C.stopPropagation()},children:jsx(FontAwesomeIcon,{icon:faUpload})})}),jsxs(Grid,{style:{overflow:"hidden"},children:[jsx(MenuCell,{style:{pointerEvents:"all"},children:jsx(MenuContainer$5,{children:jsx(Row,{$selected:!0,children:jsxs(IconContainer,{children:[jsx(FontAwesomeIcon,{icon:faBook}),jsx(MenuTooltip,{children:"Add Definition"})]})})})}),jsx(SpanOverflowCell,{children:jsxs(Container$4,{children:[jsxs(ControlRow,{children:[jsx(Label$1,{children:"Load Draft Definition"}),jsx(Detail,{children:jsx(AccentUploadButton,{multiple:!0,inputRef:u,onLoad:C=>{importDefinitions(Array.from(C),o,e,a)},children:"Load"})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Use V2 definitions (deprecated)"}),jsx(Detail,{children:jsx(AccentSlider,{isChecked:o==="v2",onChange:C=>e(updateDesignDefinitionVersion(C?"v2":"v3"))})})]}),d&&jsx(Fragment,{children:jsxs(ControlRow,{children:[jsx(Label$1,{children:"Shown Keyboard Definition"}),jsx(Detail,{children:jsx(AccentSelect,{onChange:C=>{e(updateSelectedOptionKeys([])),C&&e(updateSelectedDefinitionIndex(+C.value))},value:c[n],options:c})})]})}),d&&jsx(Layouts,{definition:d,onLayoutChange:C=>{e(updateSelectedOptionKeys(C))}}),d&&jsxs(ControlRow,{children:[jsx(Label$1,{children:"Show Matrix"}),jsx(Detail,{children:jsx(AccentSlider,{isChecked:r,onChange:C=>{e(updateShowMatrix(C))}})})]}),s.map(C=>jsx(IndentedControlRow,{children:jsx(DesignErrorMessage,{children:C})})),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Draft Definitions"}),jsxs(Detail,{children:[Object.values(i).length," Definitions"]})]}),i.map(C=>jsxs(IndentedControlRow,{children:[jsx(SubLabel,{children:C[o].name}),jsxs(Detail,{children:[formatNumberAsHex(C[o].vendorProductId,8),jsx(IconButtonUnfilledContainer,{onClick:()=>{e(unloadCustomDefinition({id:C[o].vendorProductId,version:o}))},style:{marginLeft:10,borderRadius:4},children:jsx(FontAwesomeIcon,{icon:faXmark,size:"lg"})})]})]},`${o}-${C[o].vendorProductId}`))]})})]})]})},Container$3=ut.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`,DiagnosticContainer=ut(Container$3)`
  margin-top: 20px;
  padding-top: 20px;
`,SettingsErrorMessage=ut(ErrorMessage)`
  margin: 0;
  font-style: italic;
`,Settings=()=>{const e=useDispatch(),t=useAppSelector(getShowDesignTab),o=useAppSelector(getDisableFastRemap),n=useAppSelector(getThemeMode),r=useAppSelector(getThemeName),s=useAppSelector(getRenderMode),a=useAppSelector(getSelectedConnectedDevice),[i,c]=reactExports.useState(!1),l=Object.keys(THEMES).map(_=>({label:_.replaceAll("_"," "),value:_})),d=l.find(_=>_.value===r),u=webGLIsAvailable?[{label:"2D",value:"2D"},{label:"3D",value:"3D"}]:[{label:"2D",value:"2D"}],C=u.find(_=>_.value===s);return jsx(Pane$9,{children:jsxs(Grid,{style:{overflow:"hidden"},children:[jsx(MenuCell,{style:{pointerEvents:"all",borderTop:"none"},children:jsx(MenuContainer$5,{children:jsx(Row,{$selected:!0,children:jsxs(IconContainer,{children:[jsx(FontAwesomeIcon,{icon:faToolbox}),jsx(MenuTooltip,{children:"General"})]})})})}),jsxs(SpanOverflowCell,{style:{flex:1,borderWidth:0},children:[jsxs(Container$3,{children:[jsxs(ControlRow,{children:[jsx(Label$1,{children:"Show Design tab"}),jsx(Detail,{children:jsx(AccentSlider,{onChange:()=>e(toggleCreatorMode()),isChecked:t})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Fast Key Mapping"}),jsx(Detail,{children:jsx(AccentSlider,{onChange:()=>e(toggleFastRemap()),isChecked:!o})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Light Mode"}),jsx(Detail,{children:jsx(AccentSlider,{onChange:()=>e(toggleThemeMode()),isChecked:n==="light"})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Keycap Theme"}),jsx(Detail,{children:jsx(AccentSelect,{defaultValue:d,options:l,onChange:_=>{_&&e(updateThemeName(_.value))}})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Render Mode"}),jsx(Detail,{children:jsx(AccentSelect,{defaultValue:C,options:u,onChange:_=>{_&&e(updateRenderMode(_.value))}})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Show Diagnostic Information"}),jsx(Detail,{children:a?jsx(AccentSlider,{onChange:()=>c(!i),isChecked:i}):jsx(SettingsErrorMessage,{children:"Requires connected device"})})]})]}),i&&a?jsx(DiagnosticContainer,{children:jsxs(ControlRow,{children:[jsx(Label$1,{children:"VIA Firmware Protocol"}),jsx(Detail,{children:a.protocol})]})}):null]})]})})},name="Tester",lighting="none",layouts={width:22.5,height:6.25,optionKeys:{},keys:[{row:0,col:0,x:0,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"accent"},{row:0,col:1,x:2,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:2,x:3,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:3,x:4,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:4,x:5,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:5,x:6.5,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:6,x:7.5,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:7,x:8.5,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:8,x:9.5,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:9,x:11,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:10,x:12,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:11,x:13,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:12,x:14,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:13,x:15.25,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:14,x:16.25,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:15,x:17.25,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:16,x:18.5,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:17,x:19.5,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:18,x:20.5,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:19,x:21.5,y:0,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:20,x:0,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:21,x:1,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:22,x:2,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:23,x:3,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:24,x:4,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:25,x:5,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:26,x:6,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:27,x:7,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:28,x:8,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:29,x:9,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:30,x:10,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:31,x:11,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:32,x:12,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:33,x:13,y:1.25,r:0,rx:0,ry:0,h:1,w:2,color:"mod"},{row:0,col:34,x:15.25,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:35,x:16.25,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:36,x:17.25,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:37,x:18.5,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:38,x:19.5,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:39,x:20.5,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:40,x:21.5,y:1.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:41,x:0,y:2.25,r:0,rx:0,ry:0,h:1,w:1.5,color:"mod"},{row:0,col:42,x:1.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:43,x:2.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:44,x:3.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:45,x:4.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:46,x:5.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:47,x:6.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:48,x:7.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:49,x:8.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:50,x:9.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:51,x:10.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:52,x:11.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:53,x:12.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:54,x:13.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1.5,color:"alpha"},{row:0,col:55,x:15.25,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:56,x:16.25,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:57,x:17.25,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:58,x:18.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:59,x:19.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:60,x:20.5,y:2.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:61,x:21.5,y:2.25,r:0,rx:0,ry:0,h:2,w:1,color:"mod"},{row:0,col:62,x:0,y:3.25,r:0,rx:0,ry:0,h:1,w:1.75,color:"mod"},{row:0,col:63,x:1.75,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:64,x:2.75,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:65,x:3.75,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:66,x:4.75,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:67,x:5.75,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:68,x:6.75,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:69,x:7.75,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:70,x:8.75,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:71,x:9.75,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:72,x:10.75,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:73,x:11.75,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:74,x:12.75,y:3.25,r:0,rx:0,ry:0,h:1,w:2.25,color:"accent"},{row:0,col:75,x:18.5,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:76,x:19.5,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:77,x:20.5,y:3.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:78,x:0,y:4.25,r:0,rx:0,ry:0,h:1,w:2.25,color:"mod"},{row:0,col:79,x:2.25,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:80,x:3.25,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:81,x:4.25,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:82,x:5.25,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:83,x:6.25,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:84,x:7.25,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:85,x:8.25,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:86,x:9.25,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:87,x:10.25,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:88,x:11.25,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:89,x:12.25,y:4.25,r:0,rx:0,ry:0,h:1,w:2.75,color:"mod"},{row:0,col:90,x:16.25,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:91,x:18.5,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:92,x:19.5,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:93,x:20.5,y:4.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"},{row:0,col:94,x:21.5,y:4.25,r:0,rx:0,ry:0,h:2,w:1,color:"accent"},{row:0,col:95,x:0,y:5.25,r:0,rx:0,ry:0,h:1,w:1.25,color:"mod"},{row:0,col:96,x:1.25,y:5.25,r:0,rx:0,ry:0,h:1,w:1.25,color:"mod"},{row:0,col:97,x:2.5,y:5.25,r:0,rx:0,ry:0,h:1,w:1.25,color:"mod"},{row:0,col:98,x:3.75,y:5.25,r:0,rx:0,ry:0,h:1,w:6.25,color:"alpha"},{row:0,col:99,x:10,y:5.25,r:0,rx:0,ry:0,h:1,w:1.25,color:"mod"},{row:0,col:100,x:11.25,y:5.25,r:0,rx:0,ry:0,h:1,w:1.25,color:"mod"},{row:0,col:101,x:12.5,y:5.25,r:0,rx:0,ry:0,h:1,w:1.25,color:"mod"},{row:0,col:102,x:13.75,y:5.25,r:0,rx:0,ry:0,h:1,w:1.25,color:"mod"},{row:0,col:103,x:15.25,y:5.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:104,x:16.25,y:5.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:105,x:17.25,y:5.25,r:0,rx:0,ry:0,h:1,w:1,color:"mod"},{row:0,col:106,x:18.5,y:5.25,r:0,rx:0,ry:0,h:1,w:2,color:"alpha"},{row:0,col:107,x:20.5,y:5.25,r:0,rx:0,ry:0,h:1,w:1,color:"alpha"}]},matrix={rows:1,cols:108},vendorProductId=0,fullKeyboardDefinition={name,lighting,layouts,matrix,vendorProductId},Container$2=ut.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`,TestPane=ut(Pane$9)`
  display: flex;
  height: 100%;
  max-width: 100vw;
  flex-direction: column;
`,TestContext=React.createContext([{clearTestKeys:()=>{}},(...e)=>{}]),Test$1=()=>{const e=useDispatch(),t=useAppSelector(getSelectedConnectedDevice),o=useAppSelector(getSelectedDefinition),n=useAppSelector(getSelectedKeyDefinitions),r=useAppSelector(getIsTestMatrixEnabled),s=useAppSelector(getTestKeyboardSoundsSettings),[a]=reactExports.useContext(TestContext),{progress:i}=useProgress(),l=t&&o&&n&&PROTOCOL_GAMMA<=t.protocol,d=r?o:fullKeyboardDefinition;if(!d||typeof d=="string")return null;const u=[{label:"Sine",value:"sine"},{label:"Triangle",value:"triangle"},{label:"Sawtooth",value:"sawtooth"},{label:"Square",value:"square"}],C=u.find(p=>p.value===s.waveform),_=[{label:"Wicki-Hayden",value:TestKeyboardSoundsMode.WickiHayden},{label:"Chromatic",value:TestKeyboardSoundsMode.Chromatic},{label:"Random",value:TestKeyboardSoundsMode.Random}],h=_.find(p=>p.value===s.mode);return i!==100?null:jsx(TestPane,{children:jsxs(Grid,{children:[jsx(MenuCell,{style:{pointerEvents:"all"},children:jsx(MenuContainer$5,{children:jsx(Row,{$selected:!0,children:jsxs(IconContainer,{children:[jsx(FontAwesomeIcon,{icon:faCircleQuestion}),jsx(MenuTooltip,{children:"Check Key"})]})})})}),jsx(SpanOverflowCell,{children:jsxs(Container$2,{children:[jsxs(ControlRow,{children:[jsx(Label$1,{children:"Reset Keyboard"}),jsx(Detail,{children:jsx(AccentButton,{onClick:a.clearTestKeys,children:"Reset"})})]}),l&&o?jsxs(ControlRow,{children:[jsx(Label$1,{children:"Test Matrix"}),jsx(Detail,{children:jsx(AccentSlider,{isChecked:r,onChange:p=>{e(setTestMatrixEnabled(p)),a.clearTestKeys()}})})]}):null,jsxs(ControlRow,{children:[jsx(Label$1,{children:"Key Sounds"}),jsx(Detail,{children:jsx(AccentSlider,{isChecked:s.isEnabled,onChange:p=>{e(setTestKeyboardSoundsSettings({isEnabled:p}))}})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Volume"}),jsx(Detail,{children:jsx(AccentRange,{max:100,min:0,defaultValue:s.volume,onChange:p=>{e(setTestKeyboardSoundsSettings({volume:p}))}})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Transpose"}),jsx(Detail,{children:jsx(AccentRange,{max:24,min:-24,defaultValue:s.transpose,onChange:p=>{e(setTestKeyboardSoundsSettings({transpose:p}))}})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Waveform"}),jsx(Detail,{children:jsx(AccentSelect,{isSearchable:!1,defaultValue:C,options:u,onChange:p=>{p&&e(setTestKeyboardSoundsSettings({waveform:p.value}))}})})]}),jsxs(ControlRow,{children:[jsx(Label$1,{children:"Mode"}),jsx(Detail,{children:jsx(AccentSelect,{isSearchable:!1,defaultValue:h,options:_,onChange:p=>{p&&e(setTestKeyboardSoundsSettings({mode:p.value}))}})})]})]})})]})})},Container$1=ut.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  user-select: text;
  border-top: 1px solid var(--color_accent);
  &:last-of-type {
    border-bottom: 1px solid var(--color_accent);
  }
`,printId=e=>formatNumberAsHex(e,4),ErrorListContainer=e=>{const{clear:t,save:o,hasErrors:n}=e;return jsxs(Fragment,{children:[jsxs(IconButtonGroupContainer,{style:{margin:"10px 15px"},children:[jsxs(IconButtonContainer,{onClick:t,disabled:!n,children:[jsx(FontAwesomeIcon,{size:"sm",color:"var(--color_label)",icon:faCancel}),jsx(IconButtonTooltip,{children:"Clear"})]}),jsxs(IconButtonContainer,{onClick:o,disabled:!n,children:[jsx(FontAwesomeIcon,{size:"sm",color:"var(--color_label)",icon:faDownload}),jsx(IconButtonTooltip,{children:"Download"})]})]}),e.children]})},AppErrors=({})=>{const e=useAppSelector(getAppErrors),t=useDispatch();return jsx(ErrorListContainer,{clear:()=>t(clearAppErrors()),save:()=>saveAppErrors(e),hasErrors:!!e.length,children:e.map(({timestamp:o,deviceInfo:{productId:n,productName:r,vendorId:s},message:a})=>jsxs(Container$1,{children:[o,jsx("ul",{children:a==null?void 0:a.split(`
`).map(i=>jsx("li",{children:i}))}),jsxs("ul",{children:[jsxs("li",{children:["Device: ",r]}),jsxs("li",{children:["Vid: ",printId(s)]}),jsxs("li",{children:["Pid: ",printId(n)]})]})]},o))})};async function saveErrors(e,t,o,n){try{const r=await window.showSaveFilePicker({suggestedName:`${o}.csv`}),s=[t.join(", ")],a=e.map(n),i=s.concat(...a).join(`
`),c=new Blob([i],{type:"text/csv"}),l=await r.createWritable();await l.write(c),await l.close()}catch{console.log("User cancelled save errors request")}}const saveAppErrors=async e=>saveErrors(e,["timestamp","productName","vendorId","productId","message"],"VIA-app-errors",({timestamp:t,deviceInfo:{productName:o,vendorId:n,productId:r},message:s})=>`${t}, ${o}, ${printId(n)}, ${printId(r)}, "${s}"`),IconButtonGroupContainer=ut.div`
  border-radius: 2px;
  border: 1px solid var(--border_color_icon);
  display: inline-flex;
  > button:last-child {
    border: none;
  }
`,ErrorPanes=[[1,AppErrors,faComputer,"App"]],Errors=()=>{const[e,t]=reactExports.useState(0),o=(ErrorPanes.find(([n])=>e===n)||ErrorPanes[0])[1];return jsx(Pane$9,{children:jsxs(Grid,{style:{overflow:"hidden"},children:[jsx(MenuCell,{style:{pointerEvents:"all",borderTop:"none"},children:jsx(MenuContainer$5,{children:ErrorPanes.map(([n,r,s,a])=>jsx(Row,{$selected:e===n,onClick:()=>{t(n)},children:jsxs(IconContainer,{children:[jsx(FontAwesomeIcon,{icon:s}),jsx(MenuTooltip,{children:a})]})},n))})}),jsx(SpanOverflowCell,{style:{flex:1,borderWidth:0},children:jsx(o,{})})]})})},ErrorLink=()=>{const e=useAppSelector(getAppErrors),[t]=useLocation(),o=t==="/errors";return e.length?jsx(Link$1,{to:"/errors",children:jsxs(CategoryIconContainer,{$selected:o,children:[jsx(FontAwesomeIcon,{size:"xl",icon:ErrorsPaneConfig.icon,color:o?"inherit":"gold"}),jsxs(CategoryMenuTooltip,{children:[e.length," error",e.length>1?"s":""]})]})}):null},ErrorsPaneConfig={component:Errors,path:"/errors",icon:faWarning,key:"errors",title:"Errors"},PANES=[{key:"default",component:ConfigurePane,icon:faKeyboard,title:"Configure",path:"/"},{key:"test",component:Test$1,icon:faStethoscope,path:"/test",title:"Key Tester"},{key:"design",component:DesignTab,icon:faBrush,path:"/design",title:"Design"},{key:"settings",component:Settings,icon:faGear,path:"/settings",title:"Settings"},{key:"debug",icon:faBug,component:Debug,path:"/debug",title:"Debug"},ErrorsPaneConfig],VIALogo=e=>jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 525.74 268.41",...e,children:[jsx("defs",{children:jsx("style",{children:".cls-1{fill:currentColor}"})}),jsx("g",{id:"Layer_2","data-name":"Layer 2",children:jsx("g",{id:"Layer_2-2","data-name":"Layer 2",children:jsx("path",{className:"cls-1",d:"M524.6 237.33 459.25 37.88C451.73 14.93 432.81.12 411 .12h-.13c-21.87.06-40.79 15-48.21 38.11l-64 199.23a22.93 22.93 0 0 0 43.66 14l18.74-58.35h100.81l19.13 58.5a22.93 22.93 0 0 0 43.58-14.28Zm-145-90a2.78 2.78 0 0 1-2.65-3.63l29.37-91.41C407.82 47.68 410 46 411 46c1 0 3.17 1.68 4.65 6.19l30 91.49a2.78 2.78 0 0 1-2.64 3.64ZM212.25 1.21A22.93 22.93 0 0 0 183.41 16l-64 199.23c-1.47 4.57-3.66 6.28-4.69 6.29-1 0-3.17-1.68-4.64-6.19L44.72 15.91A22.92 22.92 0 1 0 1.15 30.18l65.34 199.45c7.52 23 26.44 37.77 48.22 37.77h.14c21.86-.06 40.78-15 48.2-38.11l64-199.23a22.93 22.93 0 0 0-14.8-28.85ZM306.09 1.1a22.93 22.93 0 0 0-28.84 14.82l-71.5 222.54a22.93 22.93 0 1 0 43.66 14l71.5-222.55A22.93 22.93 0 0 0 306.09 1.1Zm-78.17 255.45a12.5 12.5 0 1 1 12.5-12.5 12.5 12.5 0 0 1-12.5 12.5Zm70.7-220.91a12.5 12.5 0 1 1 12.5-12.5 12.5 12.5 0 0 1-12.5 12.5Z"})})})]}),ExternalLinkContainer=ut.span`
  position: absolute;
  right: 1em;
  display: flex;
  gap: 1em;
`,ExternalLinks=()=>jsxs(ExternalLinkContainer,{children:[jsx("a",{href:"https://caniusevia.com/",target:"_blank",children:jsxs(CategoryIconContainer,{children:[jsx(VIALogo,{height:"25px",fill:"currentColor"}),jsx(CategoryMenuTooltip,{children:"Firmware + Docs"})]})}),jsx("a",{href:"https://discord.gg/NStTR5YaPB",target:"_blank",children:jsxs(CategoryIconContainer,{children:[jsx(FontAwesomeIcon,{size:"xl",icon:faDiscord}),jsx(CategoryMenuTooltip,{children:"Discord"})]})}),jsx("a",{href:"https://github.com/the-via/app",target:"_blank",children:jsxs(CategoryIconContainer,{children:[jsx(FontAwesomeIcon,{size:"xl",icon:faGithub}),jsx(CategoryMenuTooltip,{children:"Github"})]})})]}),Container=ut.div`
  width: 100vw;
  height: 25px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border_color_cell);
  display: flex;
  align-items: center;
  justify-content: center;
`,{DEBUG_PROD,MODE:MODE$1,DEV}={BASE_URL:"/",MODE:"production",DEV:!1,PROD:!0,SSR:!1},showDebugPane=MODE$1==="development"||DEBUG_PROD==="true"||DEV,GlobalContainer=ut(Container)`
  background: var(--bg_outside-accent);
  column-gap: 20px;
`,UnconnectedGlobalMenu=()=>{const e=useAppSelector(getShowDesignTab),[t]=useLocation(),o=reactExports.useMemo(()=>PANES.filter(n=>n.key!==ErrorsPaneConfig.key).map(n=>n.key==="design"&&!e||n.key==="debug"&&!showDebugPane?null:jsx(Link$1,{to:n.path,children:jsxs(CategoryIconContainer,{$selected:n.path===t,children:[jsx(FontAwesomeIcon,{size:"xl",icon:n.icon}),jsx(CategoryMenuTooltip,{children:n.title})]})},n.key)),[t,e]);return jsx(React.Fragment,{children:jsxs(GlobalContainer,{children:[jsx(ErrorLink,{}),o,jsx(ExternalLinks,{})]})})},overrideParam=new URL(window.location.href).searchParams.get("override_hid_check");overrideParam!==null&&localStorage.setItem("override_hid_check",overrideParam);const overrideHidCheck=localStorage.getItem("override_hid_check")||"false",OVERRIDE_HID_CHECK=!!JSON.parse(overrideHidCheck),ErrorHome=ut.div`
  background: var(--bg_gradient);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  overflow: hidden;
  height: auto;
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: 24px;
  position: absolute;
  border-top: 1px solid var(--border_color_cell);
`,UsbError=ut.div`
  align-items: center;
  display: flex;
  color: var(--color_label);
  flex-direction: column;
  height: 100%;
  justify-content: center;
  margin: 0 auto;
  max-width: 650px;
  text-align: center;
`,UsbErrorIcon=ut.div`
  font-size: 2rem;
`,UsbErrorHeading=ut.h1`
  margin: 1rem 0 0;
`,UsbErrorWebHIDLink=ut.a`
  text-decoration: underline;
  color: var(--color_label-highlighted);
`,timeoutRepeater=(e,t,o=0)=>()=>setTimeout(()=>{e(),o>0&&timeoutRepeater(e,t,o-1)()},t),Home=e=>{const{hasHIDSupport:t}=e,o=useAppDispatch();useAppSelector(getSelectedKey),useAppSelector(getSelectedDefinition),useAppSelector(getConnectedDevices),useAppSelector(getSelectedLayerIndex),useAppSelector(getSelectedKeyDefinitions),useAppSelector(getDisableFastRemap),useAppSelector(getBasicKeyToByte);const n=useAppSelector(getSelectedKeyboardAPI),r=timeoutRepeater(()=>{o(reloadConnectedDevices())},500,1),s=reactExports.createRef();return reactExports.useEffect(()=>{if(t)return s.current&&s.current.focus(),startMonitoring(),usbDetect.on("change",r),o(loadSupportedIds()),()=>{usbDetect.off("change",r)}},[]),reactExports.useEffect(()=>{o(updateSelectedKey(null))},[n]),!t&&!OVERRIDE_HID_CHECK?jsx(ErrorHome,{ref:s,tabIndex:0,children:jsxs(UsbError,{children:[jsx(UsbErrorIcon,{children:"❌"}),jsx(UsbErrorHeading,{children:"USB Detection Error"}),jsxs("p",{children:["Looks like there was a problem getting USB detection working. Right now, we only support"," ",jsx(UsbErrorWebHIDLink,{href:"https://caniuse.com/?search=webhid",target:"_blank",children:"browsers that have WebHID enabled"}),", so make sure yours is compatible before trying again."]})]})}):jsx(Fragment,{children:e.children})},useSize=e=>{const[t,o]=reactExports.useState();return reactExports.useLayoutEffect(()=>{e.current&&o(e.current.getBoundingClientRect())},[e]),useResizeObserver(e,n=>o(n.contentRect)),t},ZOOM=5.5*.8,Camera=()=>{const{progress:e}=useProgress(),t=useThree(s=>s.camera),[o,n]=[7,7],r=useSpring({config:{duration:800},from:{x:o}});return React.useEffect(()=>{e===100&&(console.debug("lets animate"),r.x.start(n))},[e]),React.useEffect(()=>(console.debug("mounting"),()=>{console.debug("unmounting")}),[]),useFrame(()=>{r.x.isAnimating&&(t.position.setZ(r.x.get()),t.position.setY(.4*Math.pow(r.x.get()-n,1)),t.updateProjectionMatrix()),t.zoom!==ZOOM&&(t.zoom=ZOOM,t.updateProjectionMatrix())}),jsx(PerspectiveCamera,{"position-z":o,makeDefault:!0,fov:25})},CaseGroup=ut.div``,OuterCase=ut.div`
  background: ${e=>e.background};
  width: ${e=>e.width}px;
  height: ${e=>e.height}px;
`,InnerCase=ut.div`
  background: ${e=>e.background};
  top: 0;
  left: 0;
  position: absolute;
  width: ${e=>e.width}px;
  height: ${e=>e.height}px;
`,CaseInsideBorder=10,Case$1=React.memo(e=>{const t=useAppSelector(getSelectedTheme),o=reactExports.useMemo(()=>t[dist.KeyColorType.Accent].c,[t]),n=e.width*CSSVarObject.keyXPos-CSSVarObject.keyXSpacing,r=CSSVarObject.keyYPos*e.height-CSSVarObject.keyYSpacing,s=CSSVarObject.insideBorder,a=n+s*1,i=n+s*3,[c,l]=[r+s,r+s*3],[d,u,C]=[.15,.25,.2].map(_=>getDarkenedColor(o,_));return jsxs(CaseGroup,{children:[jsx(OuterCase,{background:o,width:i,height:l,style:{borderRadius:8,boxShadow:"var(--box-shadow-keyboard)"}}),jsx(InnerCase,{background:`linear-gradient(200deg,${d} 40%,${u},${C} 80%)`,width:a,height:c,style:{transform:`translate( ${a-n}px,
           ${c-r}px)`,boxShadow:"var(--box-shadow-keyboard)",borderRadius:8}})]})},shallowEqual);var DisplayMode=(e=>(e[e.Test=1]="Test",e[e.Configure=2]="Configure",e[e.Design=3]="Design",e[e.ConfigureColors=4]="ConfigureColors",e))(DisplayMode||{}),KeycapState=(e=>(e[e.Pressed=1]="Pressed",e[e.Unpressed=2]="Unpressed",e))(KeycapState||{});const KeycapContainer=ut.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 52px;
  height: 54px;
  &:hover {
    z-index: 1;
    & .tooltip {
      transform: scale(1) translateY(0px);
      opacity: 1;
    }
  }
  .tooltip {
    transform: translateY(5px) scale(0.6);
    opacity: 0;
  }
`,TooltipContainer=ut.div`
  position: absolute;
  transform: rotate(${e=>e.$rotate}rad);
  width: 100%;
  height: 100%;
  bottom: 0;
`,TestOverlay=ut.div`
  transition: all 0.2s ease-out;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
`,CanvasContainerBG=ut.div``,CanvasContainer=ut.div`
  box-shadow: inset -1px -1px 0 rgb(0 0 0 / 20%),
    inset 1px 1px 0 rgb(255 255 255 / 10%);
`,ComboKeycap=e=>{const{normalizedRects:t,clipPath:o,overflowsTexture:n,macroData:r,label:s,canvasRef:a,onClick:i,onPointerDown:c,onPointerOver:l,onPointerOut:d,disabled:u,...C}=e,[_,h]=t;return jsx(Fragment,{children:jsxs(KeycapContainer,{...C,children:[jsxs(ComboKeyBoundingContainer,{$selected:e.selected,onClick:i,onPointerDown:c,onPointerOver:l,onPointerOut:d,style:{cursor:u?"initial":"pointer",position:"relative",animation:e.disabled?"initial":e.selected?".75s infinite alternate select-glow":"",transform:`translateX(${-Math.abs(_[0]-h[0])*CSSVarObject.keyXPos/2}px) perspective(100px) translateZ(${e.keycapZ}px)`,width:Math.max(_[2],h[2])*CSSVarObject.keyXPos-CSSVarObject.keyXSpacing,height:Math.max(_[3],h[3])*CSSVarObject.keyYPos-CSSVarObject.keyYSpacing,clipPath:o},children:[jsx(ComboKeyRectContainer,{style:{position:"absolute",borderRadius:3,background:getDarkenedColor(e.color.c,.8),transform:`translate(${CSSVarObject.keyXPos*_[0]}px,${CSSVarObject.keyYPos*_[1]}px)`,width:_[2]*CSSVarObject.keyXPos-CSSVarObject.keyXSpacing,height:_[3]*CSSVarObject.keyYPos-CSSVarObject.keyYSpacing}}),jsx(ComboKeyRectContainer,{style:{position:"absolute",borderRadius:3,transform:`translate(${CSSVarObject.keyXPos*h[0]}px,${CSSVarObject.keyYPos*h[1]}px)`,background:getDarkenedColor(e.color.c,.8),width:h[2]*CSSVarObject.keyXPos-CSSVarObject.keyXSpacing,height:h[3]*CSSVarObject.keyYPos-CSSVarObject.keyYSpacing}}),jsx(ComboKeyBGContainer,{style:{position:"absolute",borderRadius:3,background:getDarkenedColor(e.color.c,.8),transform:`translate(${CSSVarObject.keyXPos*_[0]+1}px,${1+CSSVarObject.keyYPos*_[1]}px)`,width:_[2]*CSSVarObject.keyXPos-CSSVarObject.keyXSpacing-2,height:_[3]*CSSVarObject.keyYPos-CSSVarObject.keyYSpacing-2}}),jsx(CanvasContainer,{style:{borderRadius:4,background:e.color.c,position:"absolute",transform:`translate(${CSSVarObject.keyXPos*_[0]+CSSVarObject.faceXPadding[0]}px,${CSSVarObject.faceYPadding[0]+CSSVarObject.keyYPos*_[1]}px)`,width:_[2]*CSSVarObject.keyXPos-CSSVarObject.keyXSpacing-CSSVarObject.faceXPadding[0]-CSSVarObject.faceXPadding[1],height:_[3]*CSSVarObject.keyYPos-CSSVarObject.keyYSpacing-CSSVarObject.faceYPadding[0]-CSSVarObject.faceYPadding[1]}}),jsx(CanvasContainer,{style:{borderRadius:4,background:e.color.c,position:"absolute",transform:`translate(${CSSVarObject.keyXPos*h[0]+CSSVarObject.faceXPadding[0]}px,${CSSVarObject.faceYPadding[0]+CSSVarObject.keyYPos*h[1]}px)`,width:h[2]*CSSVarObject.keyXPos-CSSVarObject.keyXSpacing-CSSVarObject.faceXPadding[0]-CSSVarObject.faceXPadding[1],height:h[3]*CSSVarObject.keyYPos-CSSVarObject.keyYSpacing-CSSVarObject.faceYPadding[0]-CSSVarObject.faceYPadding[1]}}),jsx(CanvasContainerBG,{style:{borderRadius:4,background:e.color.c,position:"absolute",transform:`translate(${1+CSSVarObject.keyXPos*_[0]+CSSVarObject.faceXPadding[0]}px,${1+CSSVarObject.faceYPadding[0]+CSSVarObject.keyYPos*_[1]}px)`,width:_[2]*CSSVarObject.keyXPos-CSSVarObject.keyXSpacing-CSSVarObject.faceXPadding[0]-CSSVarObject.faceXPadding[1]-2,height:_[3]*CSSVarObject.keyYPos-CSSVarObject.keyYSpacing-CSSVarObject.faceYPadding[0]-CSSVarObject.faceYPadding[1]-2},children:jsx("canvas",{ref:a,style:{}})}),DisplayMode.Test===e.mode?jsx(TestOverlay,{style:{background:e.keycapColor,opacity:e.keycapOpacity}}):null]}),(e.macroData||e.overflowsTexture)&&jsx(TooltipContainer,{$rotate:e.rotation[2],children:jsx(Keycap2DTooltip,{children:e.macroData||e.label&&e.label.tooltipLabel})})]})})},ComboKeyBoundingContainer=ut.div`
  box-sizing: border-box;
  transition: transform 0.2s ease-out;
  animation: ${e=>e.$selected?".75s infinite alternate select-glow":"initial"};
  &:hover {
    transform: perspective(100px) translateZ(-5px);
    animation: 0.5s 1 forwards select-glow;
  }
`,ComboKeyRectContainer=ut.div`
  box-sizing: border-box;
  padding: 2px 6px 10px 6px;
  box-shadow: inset -1px -1px 0 rgb(0 0 0 / 20%),
    inset 1px 1px 0 rgb(255 255 255 / 20%);
`,ComboKeyBGContainer=ut.div`
  box-sizing: border-box;
  padding: 3px 7px 10px 6px;
`,EncoderKeyContainer=ut.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 52px;
  opacity: 1;
  height: 52px;
  &:hover {
    z-index: 1;
    animation: 0.75s infinite alternate select-glow;
  }
`,EncoderKeyContent2=ut.div`
  --inner-padding: ${e=>e.$innerPadding}px;
  --size: ${e=>e.$size}px;
  --inner-size: ${e=>e.$size-e.$innerPadding*2}px;
  --half-size: ${e=>(e.$size-e.$innerPadding*2)/2}px;
  --half-size-p1: ${e=>1+(e.$size-e.$innerPadding*2)/2}px;
  --half-size-p05p: ${e=>e.$innerPadding/2+(e.$size-e.$innerPadding*2)/2}px;
  background-color: currentColor;
  padding: var(--inner-padding);
  min-width: var(--size);
  min-height: var(--size);
  clip-path: polygon(
    50% 0%,
    46.93% 3.1%,
    43.47% 0.43%,
    40.83% 3.9%,
    37.06% 1.7%,
    34.89% 5.49%,
    30.87% 3.81%,
    29.21% 7.85%,
    25% 6.7%,
    23.89% 10.92%,
    19.56% 10.33%,
    19.01% 14.66%,
    14.64% 14.64%,
    14.66% 19.01%,
    10.33% 19.56%,
    10.92% 23.89%,
    6.7% 25%,
    7.85% 29.21%,
    3.81% 30.87%,
    5.49% 34.89%,
    1.7% 37.06%,
    3.9% 40.83%,
    0.43% 43.47%,
    3.1% 46.93%,
    0% 50%,
    3.1% 53.07%,
    0.43% 56.53%,
    3.9% 59.17%,
    1.7% 62.94%,
    5.49% 65.11%,
    3.81% 69.13%,
    7.85% 70.79%,
    6.7% 75%,
    10.92% 76.11%,
    10.33% 80.44%,
    14.66% 80.99%,
    14.64% 85.36%,
    19.01% 85.34%,
    19.56% 89.67%,
    23.89% 89.08%,
    25% 93.3%,
    29.21% 92.15%,
    30.87% 96.19%,
    34.89% 94.51%,
    37.06% 98.3%,
    40.83% 96.1%,
    43.47% 99.57%,
    46.93% 96.9%,
    50% 100%,
    53.07% 96.9%,
    56.53% 99.57%,
    59.17% 96.1%,
    62.94% 98.3%,
    65.11% 94.51%,
    69.13% 96.19%,
    70.79% 92.15%,
    75% 93.3%,
    76.11% 89.08%,
    80.44% 89.67%,
    80.99% 85.34%,
    85.36% 85.36%,
    85.34% 80.99%,
    89.67% 80.44%,
    89.08% 76.11%,
    93.3% 75%,
    92.15% 70.79%,
    96.19% 69.13%,
    94.51% 65.11%,
    98.3% 62.94%,
    96.1% 59.17%,
    99.57% 56.53%,
    96.9% 53.07%,
    100% 50%,
    96.9% 46.93%,
    99.57% 43.47%,
    96.1% 40.83%,
    98.3% 37.06%,
    94.51% 34.89%,
    96.19% 30.87%,
    92.15% 29.21%,
    93.3% 25%,
    89.08% 23.89%,
    89.67% 19.56%,
    85.34% 19.01%,
    85.36% 14.64%,
    80.99% 14.66%,
    80.44% 10.33%,
    76.11% 10.92%,
    75% 6.7%,
    70.79% 7.85%,
    69.13% 3.81%,
    65.11% 5.49%,
    62.94% 1.7%,
    59.17% 3.9%,
    56.53% 0.43%,
    53.07% 3.1%
  );

  background-image: radial-gradient(
      currentColor var(--half-size),
      transparent var(--half-size-p1)
    ),
    radial-gradient(
      rgba(255, 255, 255, 0.6) var(--half-size),
      transparent var(--half-size-p1)
    ),
    radial-gradient(
      rgba(0, 0, 0, 0.2) var(--half-size),
      transparent var(--half-size-p05p)
    ),
    radial-gradient(
      rgba(0, 0, 0, 0.2) var(--half-size),
      transparent var(--half-size-p05p)
    );
  background-size: var(--size) var(--size);
  background-position: 0px 0px, -0.5px -0.5px, 0px 0px,
    calc(var(--inner-padding) / 2) calc(var(--inner-padding) / 2);
  background-repeat: repeat;

  transition: transform 0.5s ease-out;
  transform: rotate(0);
  box-sizing: border-box;
  &:hover {
    transform: rotate(450deg);
  }
`,EncoderKey=e=>jsx(EncoderKeyContainer,{onClick:e.onClick,style:e.style,children:jsx(EncoderKeyContent2,{$size:e.size&&+e.size,$innerPadding:5*e.size/52})}),getMacroData$1=({macroExpression:e,label:t})=>t&&t.length>15?t:e&&e.length?e:null,paintKeycapLabel$1=(e,t,o)=>{const n=e.getContext("2d");if(n==null)return;const r=devicePixelRatio,[s,a]=[e.width,e.height];e.width=s*r,e.height=a*r,e.style.width=`${s}px`,e.style.height=`${a}px`,n.scale(r,r);const i="Fira Sans, Arial Rounded MT, Arial Rounded MT Bold, Arial",c={x:4,y:4},l={x:4,y:4},d={x:3,y:0},u={x:4,y:4};if(n.beginPath(),n.moveTo(0,0),n.lineTo(e.width,0),n.lineTo(e.width,e.height),n.lineTo(0,e.height),n.lineTo(0,0),n.clip(),n.fillStyle=t,o!==void 0){if(o.topLabel&&o.bottomLabel){let C=16,_=.75*C,h=o.offset[0]*_,p=o.offset[1]*_;n.font=`bold ${C}px ${i}`,n.fillText(o.topLabel,c.x,c.y+h+_),n.fillText(o.bottomLabel,l.x,a-l.y-p)}else if(o.centerLabel){let C=13*o.size,_=.75*C,h=a/2;return n.font=`bold ${C}px ${i}`,n.fillText(o.label,d.x,h+.5*_),n.measureText(o.centerLabel).width>s-d.x}else if(typeof o.label=="string"){let C=22,_=.75*C;n.font=`bold ${C}px ${i}`,n.fillText(o.label,u.x,u.y+_)}}},paintKeycap$1=(e,t,o,n,r)=>{const[s,a]=[CSSVarObject.keyWidth,CSSVarObject.keyHeight];if(e.width=s*t-CSSVarObject.faceXPadding.reduce((c,l)=>c+l,0),e.height=a*o-CSSVarObject.faceYPadding.reduce((c,l)=>c+l,0),e.getContext("2d")!=null)return paintKeycapLabel$1(e,n,r)},Keycap$1=React.memo(e=>{const{label:t,scale:o,color:n,selected:r,disabled:s,mode:a,rotation:i,keyState:c,shouldRotate:l,textureWidth:d,textureHeight:u,skipFontCheck:C,idx:_}=e,h=t&&getMacroData$1(t),[p,K]=reactExports.useState(!1),[g,y]=reactExports.useState(!1),m=reactExports.useRef(null),S=React.useCallback(()=>{if(m.current&&n&&t&&(document.fonts.check('bold 16px "Fira Sans"',t.label)||C)){const L=paintKeycap$1(m.current,d,u,n.t,t);K(!!L)}},[m.current,d,t&&t.key,o[0],o[1],n&&n.t,n&&n.c,l]);reactExports.useEffect(S,[t&&t.key,C,n&&n.c,n&&n.t]),reactExports.useEffect(()=>(document.fonts.addEventListener("loadingdone",S),()=>{document.fonts.removeEventListener("loadingdone",S)}),[]);const[b,E]=[-8,0],M=DisplayMode.Test===a?TestKeyState.KeyDown===c?KeycapState.Pressed:KeycapState.Unpressed:g||r?KeycapState.Pressed:KeycapState.Unpressed,[T]=M===KeycapState.Pressed?[b,i[2]]:[E,i[2]+Math.PI*Number(l)],O=c===TestKeyState.KeyUp,v=DisplayMode.Test===a?M===KeycapState.Unpressed?O?"mediumvioletred":"lightgrey":"mediumvioletred":(M===KeycapState.Unpressed,"lightgrey"),P=M===KeycapState.Unpressed?O?.4:0:.6,[I,f,A,w]=reactExports.useMemo(()=>{const L=()=>{};return s?[L,L,L,L]:e.mode===DisplayMode.ConfigureColors?[L,D=>{e.onPointerOver&&e.onPointerOver(D,_)},L,D=>{e.onPointerDown&&e.onPointerDown(D,_)}]:[D=>e.onClick(D,_),D=>{e.onPointerOver&&e.onPointerOver(D,_),y(!0)},()=>y(!1),D=>{e.onPointerDown&&e.onPointerDown(D,_)}]},[s,e.onClick,e.onPointerDown,e.onPointerOver,y,_,a]);return l?jsx(EncoderKey,{onClick:I,size:d*CSSVarObject.keyWidth,style:{transform:`translate(${e.position[0]-(CSSVarObject.keyWidth*d-CSSVarObject.keyWidth)/2}px,${d*(CSSVarObject.keyHeight-CSSVarObject.keyWidth)/2+e.position[1]-(CSSVarObject.keyHeight*u-CSSVarObject.keyHeight)/2}px) rotate(${-e.rotation[2]}rad)`,borderRadius:3,color:e.color.c}}):e.clipPath?jsx(ComboKeycap,{...e,onClick:I,onPointerDown:w,onPointerOver:f,onPointerOut:A,keycapZ:T,keycapOpacity:P,keycapColor:v,canvasRef:m,macroData:h,overflowsTexture:p,style:{transform:`translate(${CSSVarObject.keyWidth/2+e.position[0]-(CSSVarObject.keyXPos*d-CSSVarObject.keyXSpacing)/2}px,${CSSVarObject.keyHeight/2+e.position[1]-(CSSVarObject.keyYPos*u-CSSVarObject.keyYSpacing)/2}px) rotate(${-e.rotation[2]}rad)`,width:d*CSSVarObject.keyXPos-CSSVarObject.keyXSpacing,height:u*CSSVarObject.keyYPos-CSSVarObject.keyYSpacing}}):jsx(Fragment,{children:jsxs(KeycapContainer,{onClick:I,onPointerDown:w,onPointerOver:f,onPointerOut:A,style:{transform:`translate(${CSSVarObject.keyWidth/2+e.position[0]-(CSSVarObject.keyXPos*d-CSSVarObject.keyXSpacing)/2}px,${CSSVarObject.keyHeight/2+e.position[1]-(CSSVarObject.keyYPos*u-CSSVarObject.keyYSpacing)/2}px) rotate(${-e.rotation[2]}rad)`,width:d*CSSVarObject.keyXPos-CSSVarObject.keyXSpacing,height:u*CSSVarObject.keyYPos-CSSVarObject.keyYSpacing,cursor:s?"initial":"pointer"},children:[jsxs(GlowContainer,{$selected:r,style:{animation:s?"initial":r?".75s infinite alternate select-glow":"",background:getDarkenedColor(e.color.c,.8),transform:`perspective(100px) translateZ(${T}px)`,borderRadius:3,width:d*CSSVarObject.keyXPos-CSSVarObject.keyXSpacing,height:u*CSSVarObject.keyYPos-CSSVarObject.keyYSpacing},children:[DisplayMode.Test===a?jsx(TestOverlay,{style:{background:v,opacity:P}}):null,jsx(CanvasContainer,{style:{borderRadius:4,background:e.color.c,height:"100%"},children:jsx("canvas",{ref:m,style:{}})})]}),(h||p)&&jsx(TooltipContainer,{$rotate:i[2],children:jsx(Keycap2DTooltip,{children:h||t&&t.tooltipLabel})})]})})},shallowEqual),GlowContainer=ut.div`
  box-sizing: border-box;
  padding: 2px 6px 10px 6px;
  transition: transform 0.2s ease-out;
  box-shadow: inset -1px -1px 0 rgb(0 0 0 / 20%),
    inset 1px 1px 0 rgb(255 255 255 / 20%);
  animation: ${e=>e.$selected?".75s infinite alternate select-glow":"initial"};
  &:hover {
    transform: perspective(100px) translateZ(-5px);
    animation: 0.5s 1 forwards select-glow;
  }
`;function getKeycapSharedProps(e,t,o,n,r,s,a){const{position:i,rotation:c,scale:l,color:d,idx:u,onClick:C,onPointerDown:_,onPointerOver:h}=n.coords[t],p=e.ei!==void 0;return{mode:o.mode,position:i,rotation:c,scale:getScale(e,l),textureWidth:e.w,textureHeight:e.h,textureOffsetX:e.w2?Math.abs(e.w2-e.w):0,color:d,shouldRotate:p,onPointerDown:_,onPointerOver:h,keyState:o.pressedKeys?o.pressedKeys[t]:-1,disabled:!o.selectable,selected:t===r,idx:u,label:s[t],onClick:C,key:n.indices[t],skipFontCheck:a}}const getKeysKeysIndices=e=>(t,o)=>{const n=t.ei!==void 0;return`${e}-${o}-${t.w}-${t.h}-${n}`};function getLabels(e,t,o,n){return e.matrixKeycodes.length?e.keys.map((r,s)=>getLabel(e.matrixKeycodes[s],r.w,t,e.definition,o,n)):[]}function getKeysKeys(e,t,o,n){const{keys:r}=e,{rowMap:s}=getKeyboardRowPartitions(r),a=r.map(dist.getBoundingBox),[i,c]=[Math.min(...a.map(d=>d.xStart)),Math.min(...a.map(d=>d.yStart))],l=r.map(d=>{const u={...d};return i<0&&(u.x=u.x-i),c<0&&(u.y=u.y-c),u}).map(calculatePointPosition);return{indices:r.map(getKeysKeysIndices(e.definition.vendorProductId)),coords:r.map((d,u)=>{const[C,_]=l[u],h=d.r*(2*Math.PI)/360,p=KeycapMetric.keyXSpacing/KeycapMetric.keyWidth,K=KeycapMetric.keyYSpacing/KeycapMetric.keyHeight,g=(1+p)*(d.w2||d.w)-p,y=d.h*(1+K)-K,m=getMeshName(d,s[getKeyId(d)],!1),S=e.keyColors?u:d.color,b=t[S];return{position:n(C+i,_+c),rotation:[0,0,-h],scale:[g,y,1],color:b,meshKey:m,idx:u,onClick:(E,M)=>{E.stopPropagation(),o(updateSelectedKey(M))},onPointerDown:e.onKeycapPointerDown,onPointerOver:e.onKeycapPointerOver}})}}function useSkipFontCheck(){const[e,t]=reactExports.useState(!1),o=reactExports.useCallback(()=>{t(!1)},[]),n=reactExports.useCallback(()=>{t(!0)},[]);return reactExports.useEffect(()=>{document.fonts.load("Fira Sans").then(o,n)},[]),e}const KeyGroupContainer=ut.div`
  position: absolute;
  top: ${e=>CaseInsideBorder*1.5}px;
  left: ${e=>CaseInsideBorder*1.5}px;
`,getPosition$1=(e,t)=>[e-CSSVarObject.keyWidth/2,t-CSSVarObject.keyHeight/2,0],getRGBArray=e=>e.map(([t,o])=>{const n=getRGB({hue:Math.round(255*t/360),sat:Math.round(255*o)}),r=`#${new Color(n).getHexString()}`;return{c:r,t:r}}),KeyGroup$1=e=>{const t=useAppDispatch(),o=useAppSelector(getSelectedKey),n=useAppSelector(getSelectedTheme),r=useAppSelector(getExpressions),s=useSkipFontCheck(),a=e.keyColors?getRGBArray(e.keyColors):n,{basicKeyToByte:i,byteToKey:c}=useAppSelector(getBasicKeyToByte),l=useAppSelector(y=>y.macros),{keys:d,selectedKey:u}=e,C=u===void 0?o:u,_=reactExports.useMemo(()=>getKeysKeys(e,a,t,getPosition$1),[d,a,e.onKeycapPointerDown,e.onKeycapPointerOver]),h=reactExports.useMemo(()=>getLabels(e,r,i,c),[d,e.matrixKeycodes,l,e.definition]),{width:p,height:K}=calculateKeyboardFrameDimensions(d),g=reactExports.useMemo(()=>e.keys.map((y,m)=>y.d?null:jsx(Keycap$1,{...getComboKeyProps(y),...getKeycapSharedProps(y,m,e,_,C,h,s)})),[d,C,h,e.pressedKeys,e.selectable,a,e.definition.vendorProductId,s]);return jsx(KeyGroupContainer,{height:K,width:p,style:{pointerEvents:e.selectable?"all":"none"},children:g})},generateRowColArray=(e,t,o)=>{const n=e.filter(a=>a.ei===void 0&&!a.d),r=n.reduce((a,i)=>(a[i.row][i.col]=calculatePointPosition(i),a),Array(t).fill(0).map(()=>Array(o).fill(0))).map(a=>a.sort((i,c)=>i[0]-c[0])),s=n.reduce((a,i)=>(a[i.col][i.row]=calculatePointPosition(i),a),Array(o).fill(0).map(()=>Array(t).fill(0))).map(a=>a.sort((i,c)=>i[1]-c[1]));return{rowKeys:r,colKeys:s}},Matrix=({rowKeys:e,colKeys:t})=>jsxs(SVG,{style:{position:"absolute",top:CSSVarObject.insideBorder,left:CSSVarObject.insideBorder},children:[e.map((o,n)=>jsx(RowLine,{points:o.map(r=>(r||[]).join(",")).join(" ")},n)),t.map((o,n)=>jsx(ColLine,{points:o.map(r=>(r||[]).join(",")).join(" ")},n))]}),SVG=ut.svg`
  transform: rotateZ(0);
  width: 100%;
  height: 100%;
`,RowLine=ut.polyline`
  stroke: var(--color_accent);
  stroke-width: 3;
  fill-opacity: 0;
  stroke-opacity: 0.4;
  stroke-linecap: round;
`,ColLine=ut.polyline`
  stroke: var(--color_light-grey);
  stroke-width: 3;
  fill-opacity: 0;
  stroke-opacity: 0.4;
  stroke-linecap: round;
`,MatrixLines$1=({keys:e,rows:t,cols:o,width:n,height:r})=>{const{rowKeys:s,colKeys:a}=generateRowColArray(e,t,o);return jsx(Matrix,{rowKeys:s,colKeys:a})},KeyboardCanvas$1=e=>{const{containerDimensions:t,shouldHide:o,...n}=e,{width:r,height:s}=reactExports.useMemo(()=>calculateKeyboardFrameDimensions(n.keys),[n.keys]),a=t.height,i=35,c=Math.min(Math.min(1,t&&t.width/((CSSVarObject.keyWidth+CSSVarObject.keyXSpacing)*r-CSSVarObject.keyXSpacing+i*2)),a/((CSSVarObject.keyHeight+CSSVarObject.keyYSpacing)*s-CSSVarObject.keyYSpacing+i*2))||1;return jsx("div",{style:{transform:`scale(${c}, ${c})`,opacity:o?0:1,position:"absolute",pointerEvents:o?"none":"all"},children:jsx(KeyboardCanvasContent$1,{...n,width:r,height:s})})},KeyboardGroup$2=ut.div`
  position: relative;
`,KeyboardCanvasContent$1=React.memo(e=>{const{matrixKeycodes:t,keys:o,definition:n,pressedKeys:r,mode:s,showMatrix:a,selectable:i,width:c,height:l}=e;return jsxs(KeyboardGroup$2,{children:[jsx(Case$1,{width:c,height:l}),jsx(KeyGroup$1,{...e,keys:o,mode:s,matrixKeycodes:t,selectable:i,definition:n,pressedKeys:r}),a&&jsx(MatrixLines$1,{keys:o,rows:n.matrix.rows,cols:n.matrix.cols,width:c,height:l})]})},shallowEqual),Heart=React.memo(e=>{const t=Math.atan(2/e.caseWidth),o=(80+-30)/2,n=2,r=1,a=-(-e.caseWidth-r*2-n*2)/Math.cos(t),i=.1*a/22,c=95,l=95*i,d=(a-l)/2,u=reactExports.useMemo(()=>{const _=new Shape;return _.moveTo(i*(25-o),i*(25-c)),_.bezierCurveTo(i*(25-o),i*(25-c),i*(20-o),i*(0-c),i*(0-o),i*(0-c)),_.bezierCurveTo(i*(-30-o),i*(0-c),i*(-30-o),i*(35-c),i*(-30-o),i*(35-c)),_.bezierCurveTo(i*(-30-o),i*(55-c),i*(-10-o),i*(77-c),i*(25-o),i*(95-c)),_.bezierCurveTo(i*(60-o),i*(77-c),i*(80-o),i*(55-c),i*(80-o),i*(35-c)),_.bezierCurveTo(i*(80-o),i*(35-c),i*(80-o),i*(0-c),i*(50-o),i*(0-c)),_.bezierCurveTo(i*(35-o),i*(0-c),i*(25-o),i*(25-c),i*(25-o),i*(25-c)),_},[e.caseWidth,e.caseHeight,e.color]),C={depth:4,bevelEnabled:!0,bevelSegments:10,bevelSize:1,bevelThickness:1};return jsxs("mesh",{position:[-a+d,n*2+r*2+e.caseHeight/2,0],scale:1,rotation:[Math.PI/2,t,Math.PI/2],children:[jsx("extrudeGeometry",{attach:"geometry",args:[u,C]}),jsx("meshPhongMaterial",{color:e.color,transparent:!0,opacity:1})]})},shallowEqual),makeShape2=e=>{const t=Math.tan(Math.PI*7.5/180),o=10,n=o+t*e,r=e/2,s=new Shape;let a=2,i=Math.PI/2;return s.moveTo(-n,r),s.absarc(-n-a,r-a,a,i*1+i,i*1,!0),s.absarc(-a,r,a,i*1,i*1-i,!0),s.absarc(-a,-r,a,i*3+i,i*3,!0),s.absarc(-o-a,-r-a,a,i*2+i,i*2,!0),s},Case=React.memo(e=>{const t=useAppSelector(getSelectedTheme),o=reactExports.useMemo(()=>t[dist.KeyColorType.Accent].c,[t]),n="#212020",r=reactExports.useMemo(()=>t[dist.KeyColorType.Accent].t,[t]),s=e.width*KeycapMetric.keyXPos-KeycapMetric.keyXSpacing,a=KeycapMetric.keyYPos*e.height-KeycapMetric.keyYSpacing,i=4,c=s+i*1,l=s+i*2.5,[d,u]=reactExports.useMemo(()=>[a+i,a+i*2].map(makeShape2),[a]),C=1,_=10,K=10+Math.tan(Math.PI*7.5/180)*(a+i*2);return jsxs("group",{scale:1,"position-z":-C*2,"rotation-y":-Math.PI/2,children:[jsx(Heart,{caseWidth:K,caseHeight:a,color:r}),jsxs("mesh",{position:[-C,0,-l/2],castShadow:!0,children:[jsx("extrudeGeometry",{attach:"geometry",args:[u,{depth:l,bevelEnabled:!0,bevelSize:C,bevelThickness:C,bevelSegments:_}]}),jsx("meshPhongMaterial",{color:o,shininess:100,reflectivity:1,specular:getDarkenedColor(o,.2)})]}),jsxs("mesh",{position:[0,0,-c/2],castShadow:!0,children:[jsx("extrudeGeometry",{attach:"geometry",args:[d,{depth:c,bevelEnabled:!0,bevelSize:C/2,bevelThickness:C,bevelSegments:_}]}),jsx("meshPhongMaterial",{color:n,shininess:100,reflectivity:1,specular:getDarkenedColor(o,.2)})]})]})}),getMacroData=({macroExpression:e,label:t})=>t&&t.length>15?t:e&&e.length?e:null,paintEncoder=(e,[t,o],n,r)=>{const[i,c]=[512*t,512*o];e.width=i,e.height=c;const l=e.getContext("2d"),d=2.6;if(l){l.fillStyle=n,l.clearRect(0,0,e.width,e.height),l.fillRect(0,0,e.width,e.height),l.fill(),l.fillStyle=r;const u=.4*i/d;l.ellipse(.5*i/d,2.1*c/d,u,u,Math.PI/4,0,2*Math.PI),l.fill()}},paintKeycapLabel=(e,t,o,n)=>{const r=e.getContext("2d");if(r==null)return;const s="Fira Sans, Arial Rounded MT, Arial Rounded MT Bold, Arial",a={x:.015,y:.02},i={x:.01,y:-.01},c={x:.01,y:.02};if(r.beginPath(),r.moveTo(t.bl.x*e.width,(1-t.bl.y)*e.height),r.lineTo(t.bl.x*e.width,(1-t.tr.y)*e.height),r.lineTo(t.tr.x*e.width,(1-t.tr.y)*e.height),r.lineTo(t.tr.x*e.width,(1-t.bl.y)*e.height),r.lineTo(t.bl.x*e.width,(1-t.bl.y)*e.height),r.clip(),r.fillStyle=o,n!==void 0){if(n.topLabel&&n.bottomLabel){let l=52,d=.75*l/e.height,u=n.offset[0]*d,C=n.offset[1]*d;r.font=`bold ${l}px ${s}`,r.fillText(n.topLabel,(t.bl.x+a.x)*e.width,(1-(t.tr.y-d-a.y-u))*e.height),r.fillText(n.bottomLabel,(t.bl.x+a.x)*e.width,(1-(t.bl.y+a.y+C))*e.height)}else if(n.centerLabel){let l=37.5*n.size,d=.75*l/e.height,u=(t.tr.y+t.bl.y)/2;return r.font=`bold ${l}px ${s}`,r.fillText(n.label,(t.bl.x+i.x)*e.width,(1-(u-.5*d-i.y))*e.height),r.measureText(n.centerLabel).width>(t.tr.x-(t.bl.x+i.x))*e.width}else if(typeof n.label=="string"){let l=75,d=.75*l/e.height;r.font=`bold ${l}px ${s}`,r.fillText(n.label,(t.bl.x+c.x)*e.width,(1-(t.tr.y-d-c.y))*e.height)}}},calculateTextureRects=(e,t,o,n,r)=>{const s=.3846153846153846,c=.445/19.05*s;let l=Math.min(2.75,o),d=Math.min(2.75,n);(e>1||t>1)&&(l=1,d=1);let u={bl:{x:c,y:c},tr:{x:l*s-c,y:d*s-c}},C={bl:{x:u.bl.x+.07,y:u.bl.y+.08},tr:{x:u.tr.x-.07,y:u.tr.y-.0146}};return r>0&&(C.bl.x+=r*s,C.tr.x+=r*s,u.bl.x+=r*s,u.tr.x+=r*s),{keycapRect:u,faceRect:C}},paintKeycap=(e,[t,o],n,r,s,a,i,c)=>{const l=calculateTextureRects(t,o,n,r,c),d=512;e.width=d*t,e.height=d*o;const u=e.getContext("2d");if(u!=null)return u.fillStyle=s,u.fillRect(0,0,e.width,e.height),paintKeycapLabel(e,l.faceRect,a,i)},Keycap=React.memo(e=>{const{label:t,scale:o,color:n,onClick:r,selected:s,disabled:a,mode:i,rotation:c,keyState:l,shouldRotate:d,keycapGeometry:u,textureOffsetX:C,textureWidth:_,textureHeight:h,onPointerOver:p,onPointerDown:K,idx:g}=e,y=reactExports.useRef(),m=t&&getMacroData(t),[S,b]=reactExports.useState(!1),[E,M]=reactExports.useState(!1),T=reactExports.useRef(),O=reactExports.useRef(document.createElement("canvas")),v=React.useCallback(()=>{if(O.current&&n){if(d)paintEncoder(O.current,[o[0],o[1]],n.c,n.t);else{const N=paintKeycap(O.current,[o[0],o[1]],_,h,n.c,n.t,t,C);b(!!N)}T.current.needsUpdate=!0}},[O.current,_,t&&t.key,o[0],o[1],n&&n.t,n&&n.c,d]);reactExports.useEffect(v,[t&&t.key,n&&n.c,n&&n.t]);const P=useSpring({config:{duration:800},from:{x:0,y:"#f4a0a0"},loop:s?{reverse:!0}:!1,to:{x:100,y:"#b49999"}});let I=u.boundingBox.max.z;const[f,A]=[I,I+8],w=DisplayMode.Test===i?TestKeyState.KeyDown===l?KeycapState.Pressed:KeycapState.Unpressed:E||s?KeycapState.Unpressed:KeycapState.Pressed,[L,D]=w===KeycapState.Pressed?[f,c[2]]:[A,c[2]+Math.PI*Number(d)],k=l===TestKeyState.KeyUp,F=DisplayMode.Test===i?w===KeycapState.Unpressed?k?"palevioletred":"lightgrey":"pink":(w===KeycapState.Unpressed,"lightgrey"),{z:G,b:V,rotateZ:U,tooltipScale:H}=useSpring({config:{duration:100},z:L,b:F,rotateZ:D,tooltipScale:E?1:0}),[$,Y,W,Q]=reactExports.useMemo(()=>{const N=()=>{};return a?[N,N,N,N]:e.mode===DisplayMode.ConfigureColors?[N,j=>{p&&p(j,g)},N,j=>{K&&K(j,g)}]:[j=>r(j,g),j=>{p&&p(j,g),M(!0)},()=>M(!1),j=>{K&&K(j,g)}]},[a,r,K,p,M,g,i]),z=animated.meshPhongMaterial;return jsxs(Fragment,{children:[jsx(animated.mesh,{...e,ref:y,"position-z":G,"rotation-z":U,onClick:$,onPointerDown:Q,onPointerOver:Y,onPointerOut:W,geometry:u,children:jsx(z,{attach:"material",color:s?P.y:V,children:jsx("canvasTexture",{ref:T,attach:"map",image:O.current})})}),(m||S)&&jsx(React.Suspense,{fallback:null,children:jsx(animated.group,{position:e.position,"position-z":20,scale:H,children:jsx(Html,{transform:!0,style:{pointerEvents:"none"},children:jsx(KeycapTooltip,{children:m||t&&t.tooltipLabel})})})})]})},shallowEqual),glbSrc="/assets/keyboard_components-1a09821a.glb",getSRGBArray=e=>e.map(([t,o])=>{const n=getRGB({hue:Math.round(255*t/360),sat:Math.round(255*o)}),r=`#${new Color(n).convertSRGBToLinear().getHexString()}`;return{c:r,t:r}}),getPosition=(e,t)=>[KeycapMetric.keyXPos*e/CSSVarObject.keyXPos,-t*KeycapMetric.keyYPos/CSSVarObject.keyYPos,0],KeyGroup=e=>{const t=useAppDispatch(),o=useGLTF(glbSrc,!0).scene,n=useAppSelector(getSelectedKey),r=useAppSelector(getSelectedSRGBTheme),s=useAppSelector(getExpressions),a=useSkipFontCheck(),i=e.keyColors?getSRGBArray(e.keyColors):r,{basicKeyToByte:c,byteToKey:l}=useAppSelector(getBasicKeyToByte),d=useAppSelector(m=>m.macros),{keys:u,selectedKey:C}=e,_=C===void 0?n:C,h=reactExports.useMemo(()=>getKeysKeys(e,i,t,getPosition),[u,i,e.onKeycapPointerDown,e.onKeycapPointerOver]),p=reactExports.useMemo(()=>getLabels(e,s,c,l),[u,e.matrixKeycodes,d,e.definition]),{width:K,height:g}=calculateKeyboardFrameDimensions(u),y=reactExports.useMemo(()=>e.keys.map((m,S)=>{const{meshKey:b}=h.coords[S];return m.d?null:jsx(Keycap,{keycapGeometry:(o.getObjectByName(b)||o.getObjectByName("K-R1-100")).geometry,...getKeycapSharedProps(m,S,e,h,_,p,a)})}),[u,_,p,e.pressedKeys,e.selectable,i,e.definition.vendorProductId,a]);return jsx("group",{scale:1,position:[(-K*KeycapMetric.keyXPos+KeycapMetric.keyXSpacing)/2,(KeycapMetric.keyYPos*g-KeycapMetric.keyYSpacing)/2,0],children:y})},MatrixLines=({keys:e,rows:t,cols:o,width:n,height:r})=>{const[s,a]=["lightpink","lightgrey"],{rowKeys:i,colKeys:c}=generateRowColArray(e,t,o);return jsx("group",{scale:.35,rotation:[Math.PI,0,0],position:[-n*KeycapMetric.keyXPos/2,(r+.4)*KeycapMetric.keyYPos/2,11],children:jsxs(Segments,{lineWidth:1,children:[i.flatMap(l=>{const d=l.filter(u=>u);return d.length>=2?d.reduce((u,C,_)=>u.prev===null?{res:[],prev:C}:{res:[...u.res,jsx(Segment,{start:[u.prev[0],u.prev[1],0],end:[C[0],C[1],0],color:s},`row-${_}`)],prev:C},{res:[],prev:null}).res:[]}),c.flatMap(l=>{const d=l.filter(u=>u);return d.length>=2?d.reduce((u,C,_)=>u.prev===null?{res:[],prev:C}:{res:[...u.res,jsx(Segment,{start:[u.prev[0],u.prev[1],0],end:[C[0],C[1],0],color:a},`col-${_}`)],prev:C},{res:[],prev:null}).res:[]})]})},`${t}-${o}-${n}-${r}`)},KeyboardCanvas=e=>{const{containerDimensions:t,shouldHide:o,...n}=e,{width:r,height:s}=reactExports.useMemo(()=>calculateKeyboardFrameDimensions(n.keys),[n.keys]),[a,i]=reactExports.useState(!1),{verticalPostion:c,tilt:l}=useSpring({config:{tension:35,friction:5,mass:.3},verticalPostion:a?1:-3,tilt:a?-.15:0});reactExports.useEffect(()=>{const u=document.querySelector("canvas");u&&(u.addEventListener("mouseenter",()=>{i(!0)}),u.addEventListener("mouseleave",()=>{i(!1)}))},[]);const d=Math.min(Math.min(1,t&&t.width/((CSSVarObject.keyWidth+CSSVarObject.keyXSpacing)*r-CSSVarObject.keyXSpacing+70)),500/((CSSVarObject.keyHeight+CSSVarObject.keyYSpacing)*s-CSSVarObject.keyYSpacing+70))||1;return jsx("group",{position:[0,-0,-19],scale:.015*d,visible:!o,children:jsx(KeyboardCanvasContent,{...n,width:r,height:s,verticalPostion:c,tilt:l})})},KeyboardCanvasContent=React.memo(e=>{const{matrixKeycodes:t,keys:o,definition:n,pressedKeys:r,mode:s,showMatrix:a,selectable:i,width:c,height:l,verticalPostion:d,tilt:u}=e;return jsx(animated.group,{"position-y":d,"rotation-x":u,children:jsxs(PresentationControls,{enabled:e.mode!==DisplayMode.ConfigureColors,global:!0,snap:!0,speed:1,zoom:1,polar:[-Math.PI/10,Math.PI/10],azimuth:[-Math.PI/16,Math.PI/16],config:{mass:1,tension:170,friction:26},children:[jsx(Case,{width:c,height:l}),jsx(KeyGroup,{...e,keys:o,mode:s,matrixKeycodes:t,selectable:i,definition:n,pressedKeys:r}),a&&jsx(MatrixLines,{keys:o,rows:n.matrix.rows,cols:n.matrix.cols,width:c,height:l})]})})},shallowEqual),useGlobalKeys=e=>{const t=!e,o=reactExports.useState({}),[n,r]=o;function s(i){i.preventDefault(),!t&&!i.repeat&&n[getIndexByEvent(i)??-1]!==TestKeyState.KeyDown&&r(c=>({...c,[getIndexByEvent(i)]:TestKeyState.KeyDown}))}const a=i=>{i.preventDefault(),!t&&n[getIndexByEvent(i)]!==TestKeyState.KeyUp&&r(c=>({...c,[getIndexByEvent(i)]:TestKeyState.KeyUp}))};return reactExports.useEffect(()=>(e&&(window.addEventListener("keydown",s),window.addEventListener("keyup",a)),()=>{window.removeEventListener("keydown",s),window.removeEventListener("keyup",a)}),[e]),o},invertTestKeyState=e=>e===TestKeyState.KeyDown?TestKeyState.KeyUp:TestKeyState.KeyDown,useMatrixTest=(e,t,o,n)=>{const r=reactExports.useState([]),[,s]=r,a=useDispatch(),i=reactExports.useRef(e);reactExports.useEffect(()=>{let d=[];const u=()=>{i.current=!1},C=async(_,h,p,K)=>{if(e&&_&&p){const{cols:g,rows:y}=p.matrix,m=Math.ceil(g/8),S=Math.floor(28/m);try{let b=[];for(let M=0;M<y;M+=S){const T=Math.min(y*m-b.length,m*S);b.push(...await _.getKeyboardValue(KeyboardValue.SWITCH_MATRIX_STATE,h>=12?[M]:[],T))}if(!b.some((M,T)=>M^(K[T]||0))){await _.timeout(20),i.current&&C(_,h,p,K);return}s(M=>b.reduce((T,O,v)=>{const P=O^(K[v]||0);if(P===0)return T;const I=~~(v/m),f=8*(m-1-v%m);return Array(Math.max(0,Math.min(8,g-f))).fill(0).reduce((A,w,L)=>{const D=g*I+L+f;return A[D]=(P>>L&1)===1?invertTestKeyState(A[D]):A[D],A},T)},Array.isArray(M)&&M.length===y*g?[...M]:Array(y*g).fill(TestKeyState.Initial))),await _.timeout(20),i.current&&C(_,h,p,b)}catch{i.current=!1,a(setTestMatrixEnabled(!1))}}};return e&&t&&o&&n&&(i.current=!0,C(t,o.protocol,n,d)),()=>{u()}},[e,n,t]);const c=d=>{d.preventDefault()},l=d=>{d.preventDefault()};return reactExports.useEffect(()=>(e&&(window.addEventListener("keydown",c),window.addEventListener("keyup",l)),()=>{window.removeEventListener("keydown",c),window.removeEventListener("keyup",l)}),[e]),r},useColorPainter=(e,t)=>{const o=useAppSelector(getSelectedConnectedDevice),n=useAppSelector(getSelectedKeyboardAPI),r=useAppSelector(getSelectedCustomMenuData)||{__perKeyRGB:[]},[s,a]=reactExports.useState([]);reactExports.useEffect(()=>{const c=r.__perKeyRGB??[],d=(e.find(u=>"li"in u)?e.map(u=>u.li??-1):[]).map(u=>{const C=c[u??-1];if(C)return getHSVFrom256(C)});a(d)},[r.__perKeyRGB&&r.__perKeyRGB.length,e]);const i=reactExports.useCallback((c,l)=>{if(c.buttons===1&&n){const d=Math.round(t[0]*255/360),u=Math.round(t[1]*255),C=e[l].li;C!==void 0&&(n.setPerKeyRGBMatrix(C,d,u),n.commitCustomMenu(0),a(_=>(_[l]=t,[..._])))}},[a,t,e,o]);return{keyColors:s,onKeycapPointerDown:i,onKeycapPointerOver:i}},getKeyboardCanvas=e=>e==="2D"?KeyboardCanvas$1:KeyboardCanvas,ConfigureKeyboard=e=>{const{selectable:t,dimensions:o}=e,n=useAppSelector(h=>getSelectedKeymap(h)||[]),r=useAppSelector(getSelectedKeyDefinitions),s=useAppSelector(getSelectedDefinition),a=useAppSelector(getShowKeyPainter),i=useAppSelector(getSelectedPaletteColor),{keyColors:c,onKeycapPointerDown:l,onKeycapPointerOver:d}=useColorPainter(r,i),[u,C]=reactExports.useMemo(()=>c&&r?[r.filter((h,p)=>c[p]&&c[p].length),c.filter(h=>h&&h.length)]:[null,null],[r,c]);if(!s||!o)return null;const _=getKeyboardCanvas(e.nDimension);return jsxs(Fragment,{children:[jsx(_,{matrixKeycodes:n,keys:r,selectable:!!t,definition:s,containerDimensions:o,mode:DisplayMode.Configure,shouldHide:a}),u&&u.length&&C&&C.length?jsx(_,{matrixKeycodes:n,keys:u,selectable:a,definition:s,containerDimensions:o,mode:DisplayMode.ConfigureColors,keyColors:C,onKeycapPointerDown:l,onKeycapPointerOver:d,shouldHide:!a}):null]})},TestKeyboard=e=>{const{selectable:t,containerDimensions:o,matrixKeycodes:n,keys:r,pressedKeys:s,definition:a,nDimension:i}=e;if(!o)return null;const c=getKeyboardCanvas(i);return jsx(c,{matrixKeycodes:n,keys:r,selectable:!!t,definition:a,pressedKeys:s,containerDimensions:o,mode:DisplayMode.Test})},DesignKeyboard=e=>{const{containerDimensions:t,showMatrix:o,definition:n,selectedOptionKeys:r}=e,{keys:s,optionKeys:a}=n.layouts;if(!t)return null;const i=reactExports.useMemo(()=>a?Object.entries(a).flatMap(([d,u])=>{const C=parseInt(d);return r[C]?u[r[C]]:u[0]}):[],[a,r]),c=reactExports.useMemo(()=>[...s,...i],[s,i]),l=getKeyboardCanvas(e.nDimension);return jsx(l,{matrixKeycodes:EMPTY_ARR,keys:c,selectable:!1,definition:n,containerDimensions:t,mode:DisplayMode.Design,showMatrix:o})},Design=e=>{const t=Object.values(useAppSelector(getCustomDefinitions)),o=useAppSelector(getDesignDefinitionVersion),n=useAppSelector(getSelectedDefinitionIndex),r=useAppSelector(getDesignSelectedOptionKeys),s=useAppSelector(getShowMatrix),a=reactExports.useMemo(()=>t.filter(c=>c[o]),[t,o]),i=a[n]&&a[n][o];return i&&jsx(DesignKeyboard,{containerDimensions:e.dimensions,definition:i,selectedOptionKeys:r,showMatrix:s,nDimension:e.nDimension})},EMPTY_ARR=[],Test=e=>{const t=useAppDispatch(),[o]=useLocation(),n=o==="/test",r=useAppSelector(getSelectedKeyboardAPI),s=useAppSelector(getSelectedConnectedDevice),a=useAppSelector(getSelectedDefinition),i=useAppSelector(getSelectedKeyDefinitions),c=useAppSelector(getIsTestMatrixEnabled),l=useAppSelector(getTestKeyboardSoundsSettings),d=useAppSelector(T=>getSelectedKeymap(T)||[]),[u,C]=useGlobalKeys(!c&&n),[_,h]=useMatrixTest(c&&n,r,s,a),p=reactExports.useCallback(()=>{C(EMPTY_ARR),h(EMPTY_ARR)},[C,h]),K=reactExports.useContext(TestContext);reactExports.useEffect(()=>{K[0].clearTestKeys!==p&&K[1]({clearTestKeys:p})},[K,p]),reactExports.useEffect(()=>{o!=="/test"&&(t(setTestMatrixEnabled(!1)),K[0].clearTestKeys()),o!=="/"&&t(setLayer(0))},[o]);const g=c&&i?i.map(({row:T,col:O})=>a&&_[T*a.matrix.cols+O]):[],y=c?a:fullKeyboardDefinition,m=c?i:fullKeyboardDefinition.layouts.keys;if(!y||typeof y=="string")return null;const S=c?g:u,{partitionedKeys:b}=reactExports.useMemo(()=>getKeyboardRowPartitions(m),[m]),E=c?_:u,M=b.map(T=>T.map(({row:O,col:v})=>E[O*y.matrix.cols+v]));return jsxs(Fragment,{children:[jsx(TestKeyboard,{definition:y,keys:m,pressedKeys:S,matrixKeycodes:c?d:matrixKeycodes,containerDimensions:e.dimensions,nDimension:e.nDimension}),M&&l.isEnabled&&jsx(TestKeyboardSounds,{pressedKeys:M})]})},UpdateUVMaps=()=>{const e=useGLTF(glbSrc,!0).scene;return reactExports.useEffect(()=>{Object.values(e.children).forEach(t=>{if(t.isGroup)return;const o=t,n=1/2.6,r=o.geometry,{min:s}=r.boundingBox,a=19.05,i=.445,c=o.geometry.attributes.position;o.geometry.attributes.uv||o.geometry.setAttribute("uv",new BufferAttribute(new Float32Array(c.count*2),2,!1));const l=o.geometry.attributes.uv,d=new Float32Array(l.count*2);for(let u=0;u<o.geometry.attributes.uv.count;u++)d[2*u]=n*(c.array[u*3]-s.x+i)/a,d[2*u+1]=n*(c.array[u*3+1]-s.y+i)/a;l.copyArray(d),r.center(),l.needsUpdate=!0})},[e]),null},cubeySrc="/assets/cubey-495d68a6.glb",LoaderCubey=React.memo(({visible:e,theme:t})=>{const o=useGLTF(cubeySrc);console.debug(o,"cubey");const n=reactExports.useRef(),r=e?-.3:10,s=getDarkenedColor(t.accent.c,.8),a={"upper-body":new Color(t.mod.c),"lower-body":new Color(t.mod.t),accent:new Color(s),bowtie:new Color(s)};return o.scene.children.forEach(i=>{const c=i.name.split("_")[0],l=a[c];l&&(i.material.color=l)}),useFrame(({clock:i})=>{e&&(n.current.rotation.z=Math.sin(i.elapsedTime)*(Math.PI/40),n.current.rotation.y=Math.PI+Math.sin(.6*i.elapsedTime)*(Math.PI/16),n.current.position.y=r+.2*Math.sin(i.elapsedTime))}),jsx(Fragment,{children:jsx("group",{scale:.6,position:[0,r,-19],children:jsx(PresentationControls,{enabled:!0,global:!0,snap:!0,speed:1,zoom:1,rotation:[0,0,0],polar:[-Math.PI/3,Math.PI/3],config:{mass:2,tension:200,friction:14},children:jsx("group",{ref:n,children:jsx("primitive",{object:o.scene})})})})})},shallowEqual);useGLTF.preload(cubeySrc);useGLTF.preload(glbSrc);const KeyboardBG$1=React.memo(e=>{const{onClick:t,visible:o,color:n}=e;return jsxs("mesh",{receiveShadow:!0,position:[0,-5.75,0],rotation:[-Math.PI/2+Math.PI/14,0,0],onClick:t,visible:o,children:[jsx("planeGeometry",{args:[100,100]}),jsx("meshStandardMaterial",{color:n})]})},shallowEqual),CanvasRouter$1=()=>{const[e]=useLocation(),t=reactExports.useRef(document.body),o=reactExports.useRef(null),n=useAppSelector(getLoadProgress),{progress:r}=useProgress(),s=useAppDispatch(),a=useSize(t),i=Object.values(useAppSelector(getCustomDefinitions)),c=useAppSelector(getSelectedDefinition),l=useAppSelector(getDesignDefinitionVersion),d=useAppSelector(getSelectedTheme),u=reactExports.useMemo(()=>d[dist.KeyColorType.Accent].c,[d]),[C,_]=reactExports.useState(!1),h=e==="/"&&(!c||n!==1),p=reactExports.useMemo(()=>i.filter(M=>M[l]),[i,l]),K=e==="/design"&&!p.length,g=e==="/"&&(!c||(n+r/100)/2!==1),y=reactExports.useCallback(()=>{s(updateSelectedKey(null))},[s]),m="hid"in navigator||OVERRIDE_HID_CHECK,S=!m||["/settings","/errors"].includes(e)||K||g,b=useAppSelector(getConfigureKeyboardIsSelectable),E=h;return reactExports.useEffect(()=>{document.fonts.load("bold 16px Fira Sans").finally(()=>{_(!0)})},[]),jsxs(Fragment,{children:[jsx(UpdateUVMaps,{}),jsx("div",{style:{height:500,width:"100%",top:0,transform:S?E?a?`translateY(${-300+a.height/2}px)`:"":"translateY(-500px)":"",position:S&&!E?"absolute":"relative",overflow:"visible",zIndex:0,visibility:S&&!E?"hidden":"visible"},ref:o,children:jsxs(Canvas,{flat:!0,shadows:!0,style:{overflow:"visible"},children:[jsx(Lights,{}),jsx(KeyboardBG$1,{onClick:y,color:u,visible:!E}),jsx(OrbitControls,{enabled:!1}),jsx(Camera,{}),jsx(LoaderCubey,{theme:d,visible:E&&!c}),jsx(Html,{center:!0,position:[0,E?c?0:-1:10,-19],children:m?c?jsx(Fragment,{children:jsx("div",{style:{textAlign:"center",color:"var(--color_accent)",fontSize:60},children:jsx(FontAwesomeIcon,{spinPulse:!0,icon:faSpinner})})}):jsxs(AccentButtonLarge,{onClick:()=>s(reloadConnectedDevices()),style:{width:"max-content"},children:["Authorize device",jsx(FontAwesomeIcon,{style:{marginLeft:"10px"},icon:faUnlock})]}):null}),C?jsx(KeyboardGroup$1,{containerRef:o,configureKeyboardIsSelectable:b,loadProgress:n}):null]})})]})},Lights=React.memo(()=>{const s=reactExports.useRef(null);reactExports.useEffect(()=>{s.current&&(s.current.shadow.mapSize.width=2048,s.current.shadow.mapSize.height=2048)},[s.current]);const a=React.useMemo(()=>{const c=new Object3D;return c.position.set(0,0,-19),c.updateMatrixWorld(),c},[]);return!0?jsxs(Fragment,{children:[jsx("ambientLight",{intensity:0}),jsx(SpotLight,{ref:s,distance:12+3,position:[0,12,-19+2],angle:Math.PI/5,attenuation:5,target:a,intensity:10,castShadow:!0,anglePower:5}),jsx("pointLight",{position:[3,.5,-15],intensity:.8}),jsx("pointLight",{position:[-3,.5,-15],intensity:.8})]}):jsxs(Fragment,{children:[jsx("ambientLight",{intensity:.4}),jsx("pointLight",{position:[-.5,.5,-15],intensity:1.5})]})},shallowEqual),getRouteX$1=e=>{switch(e){case"/debug":return-60;case"/design":return-40;case"/test":return-20;case"/":return 0;default:return-60}},KeyboardGroup$1=React.memo(e=>{const{loadProgress:t,configureKeyboardIsSelectable:o}=e,[n]=useLocation(),r=getRouteX$1(n),s=useSpring({config:config.stiff,x:r}),a=useSize(e.containerRef);return jsx(animated.group,{"position-x":s.x,children:jsx(Keyboards$1,{configureKeyboardIsSelectable:o,loadProgress:t,dimensions:a})})},shallowEqual),Keyboards$1=React.memo(e=>{const{loadProgress:t,dimensions:o,configureKeyboardIsSelectable:n}=e,r=-getRouteX$1("/test"),s=-getRouteX$1("/design"),a=-getRouteX$1("/debug");return jsxs(Fragment,{children:[jsx("group",{visible:t===1,children:jsx(ConfigureKeyboard,{dimensions:o,selectable:n,nDimension:"3D"})}),jsx("group",{"position-x":r,children:jsx(Test,{dimensions:o,nDimension:"3D"})}),jsx("group",{"position-x":s,children:jsx(Design,{dimensions:o,nDimension:"3D"})}),jsx("group",{"position-x":a})]})},shallowEqual),KeyboardBG=ut.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: ${e=>`linear-gradient(30deg, rgba(150,150,150,1) 10%,${getDarkenedColor(e.$color)} 50%, rgba(150,150,150,1) 90%)`};
  opacity: ${e=>e.$visible?1:0};
`,KeyboardRouteGroup=ut.div`
  position: absolute;
  left: 0;
  transform: translateX(${e=>e.$position*100}vw);
  height: 100%;
  width: 100vw;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`,CanvasRouter=()=>{const[e]=useLocation(),t=reactExports.useRef(document.body),o=reactExports.useRef(null),n=useAppSelector(getLoadProgress),{progress:r}=useProgress(),s=useAppDispatch(),a=useSize(o),i=useSize(t),c=Object.values(useAppSelector(getCustomDefinitions)),l=useAppSelector(getSelectedDefinition),d=useAppSelector(getDesignDefinitionVersion),u=useAppSelector(getSelectedTheme),C=reactExports.useMemo(()=>u[dist.KeyColorType.Accent].c,[u]),_=e==="/"&&(!l||n!==1),h=reactExports.useMemo(()=>c.filter(E=>E[d]),[c,d]),p=e==="/design"&&!h.length,K=e==="/"&&(!l||(n+r/100)/2!==1),g=reactExports.useCallback(()=>{s(updateSelectedKey(null))},[s]),m=!("hid"in navigator||OVERRIDE_HID_CHECK)||["/settings","/errors"].includes(e)||p||K,S=useAppSelector(getConfigureKeyboardIsSelectable),b=_;return jsx(Fragment,{children:jsx("div",{style:{height:500,width:"100%",top:0,transform:m?b?i?`translateY(${-300+i.height/2}px)`:"":"translateY(-500px)":"",position:m&&!b?"absolute":"relative",overflow:"visible",zIndex:2,visibility:m&&!b?"hidden":"visible"},onClick:E=>{E.target.nodeName!=="CANVAS"&&s(clearSelectedKey())},ref:o,children:m?null:jsxs(Fragment,{children:[jsx(KeyboardBG,{onClick:g,$color:C,$visible:!b}),jsx(KeyboardGroup,{containerDimensions:a,configureKeyboardIsSelectable:S,loadProgress:n})]})})})},getRouteX=e=>{switch(e){case"/debug":return-300;case"/design":return-200;case"/test":return-100;case"/":return 0;default:return-300}},KeyboardGroupContainer=ut.div`
  z-index: 2;
  display: block;
  white-space: nowrap;
  height: 100%;
  background: linear-gradient(90deg, red, blue);
  width: max-content;
  position: absolute;
  top: 0;
  left: 0;
`,KeyboardGroup=React.memo(e=>{const{loadProgress:t,configureKeyboardIsSelectable:o,containerDimensions:n}=e,[r]=useLocation(),s=reactExports.useRef(null),a=getRouteX(r),i={transition:"transform 0.25s ease-in-out",transform:`translate(${a}vw, 0px)`},c=reactExports.useCallback(()=>{s.current&&(s.current.style.transition=i.transition)},[s.current]),l=reactExports.useCallback(()=>{s.current&&(s.current.style.transition="")},[s.current]);return reactExports.useEffect(()=>(s.current&&(s.current.addEventListener("transitionend",l),s.current.style.transform=i.transform),()=>{var d;s.current&&((d=s.current)==null||d.removeEventListener("transitionend",l))}),[]),reactExports.useEffect(()=>{s.current&&s.current.style.transform!==i.transform&&(c(),s.current.style.transform=i.transform)},[a]),jsx(KeyboardGroupContainer,{ref:s,children:jsx(Keyboards,{configureKeyboardIsSelectable:o,loadProgress:t,dimensions:n})})},shallowEqual),Keyboards=React.memo(e=>{const{dimensions:t,configureKeyboardIsSelectable:o}=e;return jsxs(Fragment,{children:[jsx(KeyboardRouteGroup,{$position:0,children:jsx(ConfigureKeyboard,{dimensions:t,selectable:o,nDimension:"2D"})}),jsx(KeyboardRouteGroup,{$position:1,children:jsx(Test,{dimensions:t,nDimension:"2D"})}),jsx(KeyboardRouteGroup,{$position:2,children:jsx(Design,{dimensions:t,nDimension:"2D"})}),jsx(KeyboardRouteGroup,{$position:3})]})},shallowEqual),GlobalStyle=dt`
  *:focus {
    outline: none;
  }
`,Routes=()=>{const e="hid"in navigator||OVERRIDE_HID_CHECK,t=useAppSelector(getRenderMode),o=reactExports.useMemo(()=>PANES.map(s=>jsx(Route,{component:s.component,path:s.path},s.key)),[]),n=t==="2D"?CanvasRouter:CanvasRouter$1,r=reactExports.useState({clearTestKeys:()=>{}});return jsx(Fragment,{children:jsx(ErrorBoundary,{showDialog:!0,children:jsxs(TestContext.Provider,{value:r,children:[jsx(GlobalStyle,{}),e&&jsx(UnconnectedGlobalMenu,{}),jsx(n,{}),jsx(Home,{hasHIDSupport:e,children:o})]})})})},Root=()=>jsx(Provider,{store,children:jsx(Routes,{})}),app_global="",{MODE}={BASE_URL:"/",MODE:"production",DEV:!1,PROD:!0,SSR:!1};init({dsn:"https://1083464e2a864de791972ab8c976849a@o4504817817747456.ingest.sentry.io/4504817834655749",integrations:[new BrowserTracing],tracesSampleRate:1,normalizeDepth:10,environment:MODE});const appInsights=new Initialization({config:{instrumentationKey:"b3c046b8-137c-47f3-b28d-9049abfa9fe8"}});appInsights.loadAppInsights();appInsights.trackPageView();const elem=document.getElementById("root");elem&&(createRoot(elem).render(jsx(Root,{})),document.documentElement.dataset.themeMode=getThemeModeFromStore(),updateCSSVariables(getThemeNameFromStore()));
