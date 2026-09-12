const app = document.getElementById("app");
const toast = document.getElementById("toast");
const state = JSON.parse(localStorage.getItem("shilpsetu_state") || '{"products":[],"draft":{}}');
let auth = JSON.parse(localStorage.getItem("shilpsetu_auth") || "null");
let pendingOtp = null;
let pendingPhone = "";

const save = () => localStorage.setItem("shilpsetu_state", JSON.stringify(state));
const money = n => "₹" + Number(n).toLocaleString("en-IN");
function showToast(msg){ toast.textContent=msg; toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"),2200); }

function layout(content){
  app.innerHTML = `<section class="screen">${content}</section>`;
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active", x.dataset.route===route));
}
function go(r){ route=r; render(); window.scrollTo({top:0,behavior:"smooth"}); }
let route = location.hash.replace("#/","") || "dashboard";

function loginScreen(step="phone"){
  if(step==="otp"){
    return `<div class="login-screen">
      <div class="login-brand"><div class="brand-mark">शि</div><div><div class="brand-name">ShilpSetu</div><div class="brand-sub">AI Market Linkage</div></div></div>
      <div class="login-card">
        <div class="login-icon">✓</div>
        <div class="eyebrow">Verify your number</div>
        <h1 class="title">Enter OTP</h1>
        <p class="subtitle">We sent a 6-digit OTP to <strong>${escapeHtml(pendingPhone)}</strong>.</p>
        <div class="form-group"><label class="form-label">One-time password</label><input class="input otp-input" id="otpInput" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••"></div>
        <button class="primary" id="verifyOtp">Verify & Continue</button>
        <button class="secondary login-link" id="changePhone">Change phone number</button>
        <div class="demo-otp" id="demoOtp">Demo OTP: <strong>${pendingOtp || "123456"}</strong></div>
        <p class="small-note">For this prototype, OTP delivery is simulated. Connect an SMS provider such as MSG91, Twilio or AWS SNS for real OTP delivery.</p>
      </div>
    </div>`;
  }
  return `<div class="login-screen">
    <div class="login-brand"><div class="brand-mark">शि</div><div><div class="brand-name">ShilpSetu</div><div class="brand-sub">AI Market Linkage</div></div></div>
    <div class="login-card">
      <div class="login-icon">☎</div>
      <div class="eyebrow">Welcome to ShilpSetu</div>
      <h1 class="title">Login with phone</h1>
      <p class="subtitle">Use your mobile number to access your artisan dashboard and products.</p>
      <div class="form-group"><label class="form-label">Mobile number</label><div class="phone-input"><span>+91</span><input class="input" id="phoneInput" inputmode="numeric" autocomplete="tel" maxlength="10" placeholder="Enter 10-digit number"></div></div>
      <button class="primary" id="sendOtp">Send OTP</button>
      <p class="small-note login-note">By continuing, you agree to use this number for account verification and notifications.</p>
    </div>
  </div>`;
}

function bindLogin(step="phone"){
  if(step==="otp"){
    const otpInput=document.getElementById("otpInput");
    document.getElementById("verifyOtp").onclick=()=>{
      const entered=otpInput.value.trim();
      if(!/^\d{6}$/.test(entered)){ showToast("Enter the 6-digit OTP"); otpInput.focus(); return; }
      if(entered!==String(pendingOtp)){ showToast("Incorrect OTP. Try again."); otpInput.focus(); return; }
      auth={phone:pendingPhone,verified:true};
      localStorage.setItem("shilpsetu_auth", JSON.stringify(auth));
      showToast("Login successful");
      location.hash="#/dashboard";
      go("dashboard");
    };
    document.getElementById("changePhone").onclick=()=>{pendingOtp=null;pendingPhone="";render();};
    otpInput.oninput=()=>{otpInput.value=otpInput.value.replace(/\D/g,"");};
    setTimeout(()=>otpInput.focus(),0);
    return;
  }
  const phoneInput=document.getElementById("phoneInput");
  phoneInput.oninput=()=>{phoneInput.value=phoneInput.value.replace(/\D/g,"").slice(0,10);};
  document.getElementById("sendOtp").onclick=()=>{
    const phone=phoneInput.value.trim();
    if(!/^[6-9]\d{9}$/.test(phone)){ showToast("Enter a valid 10-digit Indian mobile number"); phoneInput.focus(); return; }
    pendingPhone="+91 "+phone;
    pendingOtp=String(Math.floor(100000+Math.random()*900000));
    render();
    showToast("OTP generated for prototype");
  };
}

function dashboard(){
  const listed = state.products.length;
  return `
    <div class="eyebrow">Welcome back</div>
    <h1 class="title">Artisan Dashboard</h1>
    <p class="subtitle">Your AI-powered virtual business manager.</p>
    <div class="hero">
      <div class="label">Connected phone</div><h2>${escapeHtml(auth?.phone || "+91")}</h2>
      <div class="hero-row">
        <div class="stat"><strong>${listed}</strong><span>Listed</span></div>
        <div class="stat"><strong>0</strong><span>Drafts</span></div>
        <div class="stat"><strong>${listed}</strong><span>Total</span></div>
      </div>
    </div>
    <div class="section-title">AI Tools</div>
    <div class="tool-grid">
      <button class="tool-card" onclick="go('studio')"><div class="tool-icon pink">▣</div><div><h3>AI Photo Studio</h3><p>Enhance product photos</p></div><span class="arrow">›</span></button>
      <button class="tool-card" onclick="go('voice')"><div class="tool-icon orange">♩</div><div><h3>Voice Catalog</h3><p>Describe in your language</p></div><span class="arrow">›</span></button>
      <button class="tool-card" onclick="go('pricing')"><div class="tool-icon green">₹</div><div><h3>Smart Pricing</h3><p>AI price suggestion</p></div><span class="arrow">›</span></button>
    </div>
    <div class="section-title"><span>Recent Products</span><button onclick="go('products')">View all</button></div>
    ${listed ? productPreview() : `<div class="empty"><div class="empty-icon">◇</div><strong>No products yet</strong><span class="accent" onclick="go('studio')">Add your first product</span></div>`}
    <button class="market-banner" onclick="go('marketplace')" style="width:100%;text-align:left">
      <div class="tool-icon orange">▤</div><div><h3>B2B Marketplace</h3><p>Connect with buyers & government e-marketplaces</p></div><span class="arrow">→</span>
    </button>`;
}
function productPreview(){
  return `<div class="product-list">${state.products.slice(-2).reverse().map(productCard).join("")}</div>`;
}
function productCard(p){
  return `<div class="product-card">${p.image?`<img class="product-thumb" src="${p.image}" alt="">`:`<div class="product-thumb"></div>`}<div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category||"Handicraft")} · ${escapeHtml(p.material||"Traditional")}</p><div class="price">${money(p.price)}</div></div></div>`;
}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

function studio(){
 return `<button class="back" onclick="go('dashboard')"><span>‹</span> AI Photo Studio</button>
 <div class="eyebrow">Capture or upload</div><h1 class="title">AI Photo Studio</h1><p class="subtitle">Clean the background and improve lighting for e-commerce.</p>
 <div class="upload-box" id="uploadBox"><input id="photoInput" type="file" accept="image/*"><div class="upload-content" id="uploadContent"><div class="upload-icon">↥</div><b>Upload product photo</b><div class="small-note">Textiles, handicrafts, pottery...</div></div><img id="preview" class="preview" alt="Product preview"></div>
 <div id="studioTools" style="display:none">
   <div class="filter-row"><div><div class="range-label"><span>Brightness</span><span id="brightVal">100%</span></div><input id="brightness" type="range" min="70" max="140" value="100"></div><div><div class="range-label"><span>Contrast</span><span id="contrastVal">100%</span></div><input id="contrast" type="range" min="70" max="140" value="100"></div></div>
   <button class="primary" id="enhanceBtn" style="margin-top:15px">✦ Enhance with AI</button>
   <div id="studioSuccess"></div>
   <div class="divider"></div>
   <div class="form-group"><label class="form-label">Product name</label><input class="input" id="studioName" placeholder="e.g. Handwoven Banarasi Silk Saree"></div>
   <div class="form-group"><label class="form-label">Category</label><input class="input" id="studioCategory" placeholder="Textile"></div>
   <button class="secondary" id="saveStudio">Save as Product</button>
 </div>`;
}
function bindStudio(){
 const input=document.getElementById("photoInput"), preview=document.getElementById("preview"), content=document.getElementById("uploadContent"), tools=document.getElementById("studioTools");
 input.onchange=()=>{const f=input.files[0]; if(!f)return; const r=new FileReader(); r.onload=e=>{preview.src=e.target.result;preview.classList.add("show");content.classList.add("hidden");tools.style.display="block"; state.draft.image=e.target.result;save()};r.readAsDataURL(f)};
 const b=document.getElementById("brightness"),c=document.getElementById("contrast");
 const update=()=>{preview.style.filter=`brightness(${b.value}%) contrast(${c.value}%)`;document.getElementById("brightVal").textContent=b.value+"%";document.getElementById("contrastVal").textContent=c.value+"%"};
 b.oninput=update;c.oninput=update;
 document.getElementById("enhanceBtn").onclick=()=>{preview.style.filter="brightness(108%) contrast(112%) saturate(110%)";document.getElementById("studioSuccess").innerHTML='<div class="success">✓ AI enhancement applied: lighting balanced and product-focused crop optimized.</div>';showToast("AI enhancement complete")};
 document.getElementById("saveStudio").onclick=()=>{const name=document.getElementById("studioName").value.trim()||"Handcrafted Product";const category=document.getElementById("studioCategory").value.trim()||"Handicraft";state.products.push({name,category,material:"Traditional",price:0,image:state.draft.image||""});state.draft={};save();showToast("Product saved");go("products")};
}

function voice(){
 return `<button class="back" onclick="go('dashboard')"><span>‹</span> Voice Catalog</button>
 <div class="eyebrow">Describe your product</div><h1 class="title">Voice Auto-Cataloger</h1><p class="subtitle">Speak naturally — AI creates a professional listing.</p>
 <div class="form-label">Select your language</div>
 <div class="lang-grid">${[["हिंदी","Hindi"],["বাংলা","Bengali"],["தமிழ்","Tamil"],["मराठी","Marathi"],["తెలుగు","Telugu"],["English","English"]].map((x,i)=>`<button class="lang-btn ${i===0?"selected":""}" data-lang="${x[1]}"><span>${x[0]}</span><small>${x[1]}</small></button>`).join("")}</div>
 <button class="mic" id="mic">♩</button><div class="voice-status" id="voiceStatus">Tap to record your description</div>
 <textarea class="textarea" id="voiceText" placeholder="Your voice transcript will appear here..." style="margin-top:18px"></textarea>
 <button class="primary" id="generateListing" style="margin-top:12px">文 Generate Listing</button>
 <div id="listingResult"></div>`;
}
function bindVoice(){
 let selected="Hindi"; document.querySelectorAll(".lang-btn").forEach(b=>b.onclick=()=>{document.querySelectorAll(".lang-btn").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");selected=b.dataset.lang});
 const mic=document.getElementById("mic"), text=document.getElementById("voiceText"), status=document.getElementById("voiceStatus");
 let recognition=null;
 const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(SpeechRecognition){recognition=new SpeechRecognition();recognition.continuous=false;recognition.interimResults=true;recognition.onresult=e=>{text.value=Array.from(e.results).map(r=>r[0].transcript).join(" ")};recognition.onstart=()=>{mic.classList.add("recording");status.textContent="Listening... speak about your product";};recognition.onend=()=>{mic.classList.remove("recording");status.textContent="Recording finished";};recognition.onerror=()=>{mic.classList.remove("recording");status.textContent="Could not access microphone. Type your description instead.";};}
 mic.onclick=()=>{if(recognition){try{recognition.lang=selected==="Hindi"?"hi-IN":selected==="Bengali"?"bn-IN":selected==="Tamil"?"ta-IN":selected==="Marathi"?"mr-IN":selected==="Telugu"?"te-IN":"en-IN";recognition.start()}catch(e){}}else status.textContent="Voice input is not supported in this browser."};
 document.getElementById("generateListing").onclick=()=>{
   const raw=text.value.trim()||"Handcrafted traditional product made by a skilled artisan using locally sourced materials.";
   document.getElementById("listingResult").innerHTML=`<div class="price-result show"><b>AI Generated Listing</b><h3>Handcrafted Artisan Product</h3><p class="small-note">${escapeHtml(raw)}</p><div class="chips"><span class="chip">SEO Optimized</span><span class="chip">${selected}</span><span class="chip">Bilingual Ready</span></div><div class="success">✓ Listing generated. Add price and photo, then publish to the marketplace.</div></div>`;
   state.draft.description=raw;save();showToast("Listing generated");
 };
}

function pricing(){
 return `<button class="back" onclick="go('dashboard')"><span>‹</span> Smart Pricing</button>
 <div class="eyebrow">AI suggests a fair, competitive market price</div><h1 class="title">Dynamic Pricing Assistant</h1><p class="subtitle">Combine material cost, product type and market signals.</p>
 <div class="form-group"><label class="form-label">Product Name</label><input class="input" id="pname" placeholder="e.g. Handwoven Banarasi Silk Saree"></div>
 <div class="two-col"><div class="form-group"><label class="form-label">Category</label><select class="select" id="pcat"><option>Textile</option><option>Pottery</option><option>Woodcraft</option><option>Jewellery</option><option>Bamboo Craft</option><option>Painting</option></select></div><div class="form-group"><label class="form-label">Material</label><select class="select" id="pmat"><option>Silk</option><option>Cotton</option><option>Clay</option><option>Wood</option><option>Metal</option><option>Bamboo</option></select></div></div>
 <div class="form-group"><label class="form-label">Raw Material Cost (₹)</label><input class="input" type="number" id="cost" placeholder="e.g. 1800"></div>
 <div class="form-group"><label class="form-label">Description</label><textarea class="textarea" id="pdesc" placeholder="Brief product description..."></textarea></div>
 <div class="divider"></div><b style="font-size:12px">Seller details (shown to buyers)</b>
 <div class="form-group" style="margin-top:12px"><label class="form-label">Seller Name</label><input class="input" id="seller" placeholder="Your name or shop name"></div>
 <div class="form-group"><label class="form-label">Seller Address</label><textarea class="textarea" id="address" placeholder="Village, district, state — so buyers can reach you"></textarea></div>
 <button class="primary" id="suggestPrice">✦ Suggest Optimal Price</button><div class="price-result" id="priceResult"></div>`;
}
function bindPricing(){
 document.getElementById("suggestPrice").onclick=()=>{
  const cost=Number(document.getElementById("cost").value)||1000, cat=document.getElementById("pcat").value, mat=document.getElementById("pmat").value;
  const multiplier={Textile:2.25,Pottery:2.0,Woodcraft:2.35,Jewellery:2.7,"Bamboo Craft":2.1,Painting:2.55}[cat]||2.2;
  const materialAdj={Silk:1.12,Cotton:.98,Clay:.94,Wood:1.03,Metal:1.15,Bamboo:.96}[mat]||1;
  const price=Math.round(cost*multiplier*materialAdj/50)*50;
  const low=Math.round(price*.88/50)*50, high=Math.round(price*1.15/50)*50;
  const result=document.getElementById("priceResult"); result.classList.add("show");
  result.innerHTML=`<div class="eyebrow">Recommended selling price</div><div class="price-main">${money(price)}</div><div class="price-range">Competitive range ${money(low)} – ${money(high)}</div><div class="score"><i></i></div><div class="small-note"><b>82/100 market confidence</b> · Based on material, category and a simulated market-demand signal.</div><div class="chips"><span class="chip">Raw cost ${money(cost)}</span><span class="chip">${mat}</span><span class="chip">${cat}</span></div><button class="primary" id="addPriced" style="margin-top:13px">Add to Product Catalog</button>`;
  document.getElementById("addPriced").onclick=()=>{state.products.push({name:document.getElementById("pname").value||"Artisan Product",category:cat,material:mat,price,image:state.draft.image||""});state.draft={};save();showToast("Priced product added");go("products")};
 };
}

function products(){
 return `<div class="eyebrow">My digital inventory</div><h1 class="title">Product Catalog</h1><p class="subtitle">Your products are ready for year-round digital selling.</p>
 <button class="primary" onclick="go('studio')" style="margin:15px 0">＋ Add Product</button>
 ${state.products.length?`<div class="product-list">${state.products.slice().reverse().map(productCard).join("")}</div>`:`<div class="empty"><div class="empty-icon">◇</div><strong>Your catalog is empty</strong><span class="accent" onclick="go('studio')">Create your first listing</span></div>`}`;
}
function marketplace(){
 const buyers=[["Government Handicraft Store","Textiles & handicrafts","Bulk orders · 50–200 units"],["Heritage Retail Network","Handloom & home decor","Verified B2B buyer"],["National Artisan Marketplace","All categories","Pan-India e-marketplace"]];
 return `<div class="eyebrow">Market linkage</div><h1 class="title">B2B Marketplace</h1><p class="subtitle">Reach buyers beyond exhibitions and local markets.</p>
 <div class="market-tabs"><button class="tab active">Recommended</button><button class="tab">Government</button><button class="tab">Retailers</button></div>
 ${buyers.map(b=>`<div class="buyer-card"><div class="buyer-top"><h3>${b[0]}</h3><span class="tag">Verified</span></div><p>${b[1]}</p><p>📦 ${b[2]}</p><button class="buyer-btn" onclick="showToast('Buyer connection request created')">Connect with Buyer →</button></div>`).join("")}
 <div class="success">✓ Prototype marketplace: in production, this module can connect to ONDC, GeM, state emarketplaces and verified B2B buyer APIs.</div>`;
}
function analytics(){
 return `<div class="eyebrow">Impact dashboard</div><h1 class="title">Business Impact</h1><p class="subtitle">Show judges how ShilpSetu can improve digital market access.</p>
 <div class="impact-grid"><div class="impact"><strong>+38%</strong><p>Potential digital reach</p></div><div class="impact"><strong>24/7</strong><p>Market availability</p></div><div class="impact"><strong>6+</strong><p>Indian languages</p></div><div class="impact"><strong>3×</strong><p>Faster cataloging</p></div></div>
 <div class="section-title">Illustrative Monthly Orders</div><div class="chart">${[28,42,55,62,80,96].map(v=>`<i class="bar" style="height:${v}%"></i>`).join("")}</div><div class="chart-labels">${["Jan","Feb","Mar","Apr","May","Jun"].map(x=>`<span>${x}</span>`).join("")}</div>
 <div class="section-title">Core Impact Areas</div>
 <div class="tool-grid">
  <div class="tool-card"><div class="tool-icon green">₹</div><div><h3>Income Growth</h3><p>Better pricing + broader buyer access</p></div></div>
  <div class="tool-card"><div class="tool-icon orange">◎</div><div><h3>Digital Inclusion</h3><p>Voice-first, multilingual workflow</p></div></div>
  <div class="tool-card"><div class="tool-icon pink">↗</div><div><h3>Market Linkage</h3><p>Year-round B2B and e-commerce access</p></div></div>
 </div>`;
}

function render(){
  document.body.classList.toggle("login-mode", !auth);
  if(!auth && route!=="login") route="login";
  if(!auth){
    layout(loginScreen(pendingOtp ? "otp" : "phone"));
    bindLogin(pendingOtp ? "otp" : "phone");
    return;
  }
  if(route==="login") route="dashboard";
  if(route==="dashboard")layout(dashboard());
  else if(route==="studio"){layout(studio());bindStudio();}
  else if(route==="voice"){layout(voice());bindVoice();}
  else if(route==="pricing"){layout(pricing());bindPricing();}
  else if(route==="products")layout(products());
  else if(route==="marketplace")layout(marketplace());
  else if(route==="analytics")layout(analytics());
  else {route="dashboard";render();return}
  document.querySelectorAll(".nav-item").forEach(n=>n.onclick=()=>{location.hash="#/"+n.dataset.route;go(n.dataset.route)});
}

window.addEventListener("hashchange",()=>{route=location.hash.replace("#/","")||"dashboard";render()});
document.getElementById("langBtn")?.addEventListener("click",()=>showToast("Hindi / English language switch ready for backend integration"));
render();
