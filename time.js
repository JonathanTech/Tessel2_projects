setImmediate(function loop(){
  "use strict";
  console.log("date:", new Date())
  setTimeout(loop, 999)
})