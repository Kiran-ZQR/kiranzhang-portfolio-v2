/* Vanilla Three.js adapter for the supplied Pixel Blast. liquid=false: no postprocessing needed. */
window.createPixelBlast=function(container){
 const T=window.THREE;if(!T||!window.PixelBlastFragment)return null;
 let renderer;try{renderer=new T.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});}catch{return null;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearAlpha(0);container.append(renderer.domElement);
 const uniforms={uPalette:{value:['#075136','#c82519','#d6a516','#d8d0bd','#191d1b'].map(c=>new T.Color(c))},uResolution:{value:new T.Vector2()},uTime:{value:36},uPixelSize:{value:4*renderer.getPixelRatio()},uScale:{value:2},uDensity:{value:1},uPixelJitter:{value:0},uEnableRipples:{value:1},uRippleSpeed:{value:.4},uRippleThickness:{value:.12},uRippleIntensity:{value:1.5},uEdgeFade:{value:.25},uShapeType:{value:0},uClickPos:{value:Array.from({length:10},()=>new T.Vector2(-1,-1))},uClickTimes:{value:new Float32Array(10)}};
 const material=new T.ShaderMaterial({uniforms,vertexShader:'void main(){gl_Position=vec4(position,1.0);}',fragmentShader:window.PixelBlastFragment,glslVersion:T.GLSL3,transparent:true,depthWrite:false,depthTest:false});
 const geometry=new T.PlaneGeometry(2,2),scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,1);scene.add(new T.Mesh(geometry,material));
 let index=0,disposed=false;
 function resize(){renderer.setSize(container.clientWidth||1,container.clientHeight||1,false);uniforms.uResolution.value.set(renderer.domElement.width,renderer.domElement.height);}
 function ripple(e){const r=container.getBoundingClientRect(),d=renderer.getPixelRatio();uniforms.uClickPos.value[index].set((e.clientX-r.left)*d,(r.bottom-e.clientY)*d);uniforms.uClickTimes.value[index]=uniforms.uTime.value;index=(index+1)%10;}
 const observer=new ResizeObserver(resize);observer.observe(container);container.addEventListener('pointerdown',ripple);resize();
 return {render(seconds){if(!disposed){uniforms.uTime.value=36+seconds*.5;renderer.render(scene,camera);}},dispose(){if(disposed)return;disposed=true;observer.disconnect();container.removeEventListener('pointerdown',ripple);geometry.dispose();material.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
};
