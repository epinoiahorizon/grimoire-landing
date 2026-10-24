/* Epinoia Horizon — Store Runtime (Catalog, 3D GLB Support, Cart, Admin IndexedDB) */
(function() {
  'use strict';

  // Default Seed Catalog (Merlin Sovereign Pass + Artisan Handmade Pendants + 3D Animation & CAD Studio)
  const DEFAULT_PRODUCTS = [
  {
    "id": "merlin-harness",
    "title": "Merlin Sovereign High Pass",
    "category": "sovereign",
    "categoryLabel": "AI Workspace",
    "price": 29,
    "badge": "HIGH PLAN · FULL FLEET",
    "shortDesc": "Full-tier Sanctum Workspace access unlocking Merlin (Claude Opus 5), Nxelle Codex (GLM 5.3), and Jie with 1,000 msgs/day and 10 file uploads.",
    "fullDesc": "Merlin Sovereign High Pass delivers unrestricted access to our flagship frontier engines inside the Epinoia Sanctum Workspace (/app/). Unlock Merlin on Claude Opus 5 for deep architectural synthesis, Nxelle Codex on GLM 5.3 Sovereign for surgical code generation, and Jie for rapid multi-disciplinary operations—backed by 1,000 messages per day (including 100 frontier Opus/GLM messages) and 10 document/code file attachments up to 1 MB each.",
    "modelUrl": "/assets/models/wizard.glb",
    "has3D": true,
    "specs": {
      "Primary Personas": "Merlin (Claude Opus 5), Nxelle Codex (GLM 5.3), Jie",
      "Daily Message Quota": "1,000 Total Msgs/Day (100 Frontier Opus 5 / GLM 5.3)",
      "File Attachments": "Up to 10 Files per Prompt (Max 1 MB per file)",
      "Workspace Features": "Cloud Auth, Persistent Chat History & Full Markdown HUD",
      "Billing & Activation": "$29 USD / Month (Rp 465.000) · Instant License Key"
    },
    "provenance": {
      "schemaVersion": 1,
      "facets": {
        "who": "Epinoia Horizon Atelier",
        "what": "Merlin Sovereign High Pass — HIGH PLAN · FULL FLEET",
        "when": "",
        "why": "Full-tier Sanctum Workspace access unlocking Merlin (Claude Opus 5), Nxelle Codex (GLM 5.3), and Jie with 1,000 msgs/day and 10 file uploads.",
        "where": "Epinoia Horizon Vault",
        "how": "Billing & Activation: $29 USD / Month (Rp 465.000) · Instant License Key; Daily Message Quota: 1,000 Total Msgs/Day (100 Frontier Opus 5 / GLM 5.3); File Attachments: Up to 10 Files per Prompt (Max 1 MB per file); Primary Personas: Merlin (Claude Opus 5), Nxelle Codex (GLM 5.3), Jie; Workspace Features: Cloud Auth, Persistent Chat History & Full Markdown HUD"
      },
      "missing": [
        "when"
      ],
      "root": "0xabdd47ae77c024f648d8e2c124894de314dc657f69e2b7d6bdb08a951b84960f",
      "model": {
        "url": "/assets/models/wizard.glb",
        "sha256": "f9db621ff95ada82236c62a84cfadee86da1879e434915597b45a79475c3afcc",
        "bytes": 984272
      },
      "convention": "wishing_tree v1: leaf=sha256(0x00||canonical_json), node=sha256(0x01||l||r); facets who/what/when/why/where/how"
    }
  },
  {
    "id": "solstice-pendant",
    "title": "Solstice Crystal Talisman Pendant",
    "category": "jewelry",
    "categoryLabel": "Handmade Pendant",
    "price": 45,
    "badge": "HANDMADE · 925 SILVER",
    "shortDesc": "Hand-forged 925 sterling silver pendant featuring a natural raw double-terminated quartz crystal core and hand-engraved bindrunes.",
    "fullDesc": "Artisan handcrafted talisman created using traditional lost-wax casting and hand-finishing techniques by Epinoia Horizon Atelier. The centerpiece holds a high-clarity natural raw quartz crystal nestled in organic 925 sterling silver rootwork. Each bindrune is engraved by hand with cold chisel tools.",
    "modelUrl": "/assets/models/crystal.glb",
    "has3D": true,
    "specs": {
      "Metal": "Solid Sterling Silver 925 (Oxidized Antique Finish)",
      "Stone": "Natural Raw Double-Terminated Quartz Crystal",
      "Pendant Size": "48mm x 22mm x 16mm",
      "Chain": "60cm Handcrafted Wheat Chain (925 Silver) Included",
      "Crafted By": "Epinoia Horizon Artisan Jewelry Atelier"
    },
    "provenance": {
      "schemaVersion": 1,
      "facets": {
        "who": "Epinoia Horizon Atelier",
        "what": "Solstice Crystal Talisman Pendant — HANDMADE · 925 SILVER",
        "when": "",
        "why": "Hand-forged 925 sterling silver pendant featuring a natural raw double-terminated quartz crystal core and hand-engraved bindrunes.",
        "where": "Epinoia Horizon Vault",
        "how": "Chain: 60cm Handcrafted Wheat Chain (925 Silver) Included; Crafted By: Epinoia Horizon Artisan Jewelry Atelier; Metal: Solid Sterling Silver 925 (Oxidized Antique Finish); Pendant Size: 48mm x 22mm x 16mm; Stone: Natural Raw Double-Terminated Quartz Crystal"
      },
      "missing": [
        "when"
      ],
      "root": "0x60cd55d19a2d3133d63edc57725ceaf0367f00e8430e4b0315e6af2de2587ef5",
      "model": {
        "url": "/assets/models/crystal.glb",
        "sha256": "1229e8e24ed4e3cc011bdf2e1750765ec282743b09f12a10f170e175eb04ed74",
        "bytes": 35600
      },
      "convention": "wishing_tree v1: leaf=sha256(0x00||canonical_json), node=sha256(0x01||l||r); facets who/what/when/why/where/how"
    }
  },
  {
    "id": "aetherial-lantern",
    "title": "Aetherial Relic Cage Pendant",
    "category": "jewelry",
    "categoryLabel": "Artisan Jewelry",
    "price": 55,
    "badge": "HANDMADE · 18K VERMEIL",
    "shortDesc": "Handcrafted filigree lantern cage pendant in 18K gold vermeil over 925 silver encapsulating natural tourmaline crystal shards.",
    "fullDesc": "Constructed from layered filigree wirework and 3D lost-wax precision casting, this relic lantern cage captures ambient light through raw multi-color tourmaline crystal shards. Features a screw-lock vault bale with custom celestial inscriptions along the circumference.",
    "modelUrl": "/assets/models/lantern.glb",
    "has3D": true,
    "specs": {
      "Metal": "18K Gold Vermeil over Solid 925 Sterling Silver",
      "Gemstone": "Untreated Bi-Color Tourmaline Shards",
      "Mechanism": "Threaded Miniature Vault Bale Lock",
      "Dimensions": "38mm x 18mm",
      "Edition": "Signed & Numbered Artisan Run"
    },
    "provenance": {
      "schemaVersion": 1,
      "facets": {
        "who": "Epinoia Horizon Atelier",
        "what": "Aetherial Relic Cage Pendant — HANDMADE · 18K VERMEIL",
        "when": "",
        "why": "Handcrafted filigree lantern cage pendant in 18K gold vermeil over 925 silver encapsulating natural tourmaline crystal shards.",
        "where": "Epinoia Horizon Vault",
        "how": "Dimensions: 38mm x 18mm; Edition: Signed & Numbered Artisan Run; Gemstone: Untreated Bi-Color Tourmaline Shards; Mechanism: Threaded Miniature Vault Bale Lock; Metal: 18K Gold Vermeil over Solid 925 Sterling Silver"
      },
      "missing": [
        "when"
      ],
      "root": "0x6220e9ca74313fd977a631adaf1ae07305fcb3bd49b58a0415b3507d5dcedc21",
      "model": {
        "url": "/assets/models/lantern.glb",
        "sha256": "7e85a7265542f682bd1b954ec7e525b3edf473edb7f40303e315c93cc39bcf61",
        "bytes": 36684
      },
      "convention": "wishing_tree v1: leaf=sha256(0x00||canonical_json), node=sha256(0x01||l||r); facets who/what/when/why/where/how"
    }
  },
  {
    "id": "gold-ingot-pendant",
    "title": "Alchemist Pure Ingot Bar Pendant",
    "category": "jewelry",
    "categoryLabel": "Handmade Pendant",
    "price": 38,
    "badge": "HANDMADE · SIGNATURE",
    "shortDesc": "Heavy tactile hand-poured solid silver/bronze fusion bar pendant stamped with arcane alchemy weights and Epinoia eye hallmark.",
    "fullDesc": "Poured directly into hand-carved soapstone molds to create authentic organic surface ripples. Each ingot bar pendant is hand-stamped with the Epinoia all-seeing eye hallmark, alchemical weight sigils, and 925 purity insignia.",
    "modelUrl": "/assets/models/gold-ingots.glb",
    "has3D": true,
    "specs": {
      "Material": "Hand-Poured Heavy Silver 925 / Bronze Fusion",
      "Weight": "36.5 grams",
      "Hallmark": "Epinoia All-Seeing Eye + Alchemical Sigils",
      "Bale": "Heavy Duty 5mm Round Rope Bale",
      "Packaging": "Wax-Sealed Leather Grimoire Box"
    },
    "provenance": {
      "schemaVersion": 1,
      "facets": {
        "who": "Epinoia Horizon Atelier",
        "what": "Alchemist Pure Ingot Bar Pendant — HANDMADE · SIGNATURE",
        "when": "",
        "why": "Heavy tactile hand-poured solid silver/bronze fusion bar pendant stamped with arcane alchemy weights and Epinoia eye hallmark.",
        "where": "Epinoia Horizon Vault",
        "how": "Bale: Heavy Duty 5mm Round Rope Bale; Hallmark: Epinoia All-Seeing Eye + Alchemical Sigils; Material: Hand-Poured Heavy Silver 925 / Bronze Fusion; Packaging: Wax-Sealed Leather Grimoire Box; Weight: 36.5 grams"
      },
      "missing": [
        "when"
      ],
      "root": "0x63c79573746784de37a72f4baf16f9d08443ad59887502827b45befe210fa104",
      "model": {
        "url": "/assets/models/gold-ingots.glb",
        "sha256": "fea904965ac800dde95a79dc5de4c5c4bf8f6532f21ea515e6d87c76cb3e4bb4",
        "bytes": 36696
      },
      "convention": "wishing_tree v1: leaf=sha256(0x00||canonical_json), node=sha256(0x01||l||r); facets who/what/when/why/where/how"
    }
  },
  {
    "id": "previs-pack",
    "title": "3D Character & Cinematic Animation",
    "category": "studio3d",
    "categoryLabel": "3D Animation Studio",
    "price": 150,
    "badge": "3D ANIMATOR · CUSTOM RIG",
    "shortDesc": "Bespoke 3D character sculpting, kinematic skeletal rigging, and 120 FPS cinematic animation sequences by Epinoia 3D Studio.",
    "fullDesc": "Commission the Epinoia Horizon 3D Animation Studio for custom 3D character modeling, biomechanical & organic skeletal rigging (IK/FK + facial blendshapes), and high-framerate cinematic animation sequences ready for Blender, Unreal Engine 5, Unity, or WebGL.",
    "modelUrl": "/assets/models/chest.glb",
    "has3D": true,
    "specs": {
      "Deliverables": "Rigged 3D Mesh + Keyframe/Motion Animation Sequence",
      "Formats": ".BLEND, .FBX, .GLTF / .GLB, Unreal & Unity Ready",
      "Rigging": "Full IK/FK Skeletal Hierarchy + Weight Painting",
      "Textures": "4K PBR Texture Maps (Albedo, Normal, Roughness, Metallic)",
      "Revisions": "Includes 3 Interactive 3D Previs Review Rounds"
    },
    "provenance": {
      "schemaVersion": 1,
      "facets": {
        "who": "Epinoia Horizon Atelier",
        "what": "3D Character & Cinematic Animation — 3D ANIMATOR · CUSTOM RIG",
        "when": "",
        "why": "Bespoke 3D character sculpting, kinematic skeletal rigging, and 120 FPS cinematic animation sequences by Epinoia 3D Studio.",
        "where": "Epinoia Horizon Vault",
        "how": "Deliverables: Rigged 3D Mesh + Keyframe/Motion Animation Sequence; Formats: .BLEND, .FBX, .GLTF / .GLB, Unreal & Unity Ready; Revisions: Includes 3 Interactive 3D Previs Review Rounds; Rigging: Full IK/FK Skeletal Hierarchy + Weight Painting; Textures: 4K PBR Texture Maps (Albedo, Normal, Roughness, Metallic)"
      },
      "missing": [
        "when"
      ],
      "root": "0x8f431ca660237e96fdbb469e2659520e9a4d3ab65d61b9d3755d2e9f2564fe0f",
      "model": {
        "url": "/assets/models/chest.glb",
        "sha256": "57031e1b6102dd9bec3e27e966655588d18c3fdede34232a6b6497ce57030a85",
        "bytes": 35776
      },
      "convention": "wishing_tree v1: leaf=sha256(0x00||canonical_json), node=sha256(0x01||l||r); facets who/what/when/why/where/how"
    }
  },
  {
    "id": "arcanum-sdk",
    "title": "Custom 3D Jewelry CAD & Wax Sculpt",
    "category": "studio3d",
    "categoryLabel": "3D Jewelry Design",
    "price": 85,
    "badge": "3D CAD · LOST-WAX READY",
    "shortDesc": "Custom 3D ZBrush/MatrixGold jewelry sculpting and print-ready STL/OBJ files engineered for lost-wax metal casting.",
    "fullDesc": "Turn your custom pendant, signet ring, or talisman concept into a production-ready 3D sculpt. Engineered with precise wall thickness, stone-setting prongs, and sprue tolerances for high-resolution resin 3D printing and direct lost-wax casting in silver or gold.",
    "modelUrl": "/assets/models/open-book.glb",
    "has3D": true,
    "specs": {
      "Sculpting": "High-Detail Organic & Geometric 3D Jewelry Sculpt",
      "Print Readiness": "Manifold Watertight .STL & .OBJ for Wax 3D Printing",
      "Gemstone Seats": "Calibrated Prong / Bezel / Channel Cutouts",
      "Visuals": "Includes 4K Photorealistic Raytraced Turntable Render",
      "Option": "Can be cast directly in 925 Silver by Epinoia Atelier"
    },
    "provenance": {
      "schemaVersion": 1,
      "facets": {
        "who": "Epinoia Horizon Atelier",
        "what": "Custom 3D Jewelry CAD & Wax Sculpt — 3D CAD · LOST-WAX READY",
        "when": "",
        "why": "Custom 3D ZBrush/MatrixGold jewelry sculpting and print-ready STL/OBJ files engineered for lost-wax metal casting.",
        "where": "Epinoia Horizon Vault",
        "how": "Gemstone Seats: Calibrated Prong / Bezel / Channel Cutouts; Option: Can be cast directly in 925 Silver by Epinoia Atelier; Print Readiness: Manifold Watertight .STL & .OBJ for Wax 3D Printing; Sculpting: High-Detail Organic & Geometric 3D Jewelry Sculpt; Visuals: Includes 4K Photorealistic Raytraced Turntable Render"
      },
      "missing": [
        "when"
      ],
      "root": "0x33f28765bb0ed68d243c0965dc9c1dee0051a351e8f79bda86a586f8cebc09ac",
      "model": {
        "url": "/assets/models/open-book.glb",
        "sha256": "015d6c9254f8046182474903554faca8d27cd646b3fde6326aa08f5243ec0d3b",
        "bytes": 27080
      },
      "convention": "wishing_tree v1: leaf=sha256(0x00||canonical_json), node=sha256(0x01||l||r); facets who/what/when/why/where/how"
    }
  }
];

  // Database / LocalStorage Sync
  window.EpinoiaStore = {
    getProducts: function() {
      try {
        const custom = localStorage.getItem('epinoia_custom_products_v3');
        if (custom) {
          const parsed = JSON.parse(custom);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch(e) {}
      return DEFAULT_PRODUCTS;
    },

    saveProducts: function(products) {
      localStorage.setItem('epinoia_custom_products_v3', JSON.stringify(products));
    },

    getProductById: function(id) {
      const all = this.getProducts();
      return all.find(p => p.id === id) || all[0];
    },

    // Cart Management
    getCart: function() {
      try {
        return JSON.parse(localStorage.getItem('epinoia_cart') || '[]');
      } catch(e) { return []; }
    },

    addToCart: function(product) {
      const cart = this.getCart();
      const existing = cart.find(item => item.id === product.id);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          categoryLabel: product.categoryLabel,
          modelUrl: product.modelUrl,
          qty: 1
        });
      }
      localStorage.setItem('epinoia_cart', JSON.stringify(cart));
      this.updateCartUI();
      this.openCart();
    },

    addToCartById: function(id) {
      const product = this.getProductById(id);
      if (product) this.addToCart(product);
    },

    removeFromCart: function(id) {
      let cart = this.getCart().filter(item => item.id !== id);
      localStorage.setItem('epinoia_cart', JSON.stringify(cart));
      this.updateCartUI();
    },

    updateCartUI: function() {
      const cart = this.getCart();
      const badges = document.querySelectorAll('.cart-badge');
      const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      badges.forEach(b => b.textContent = totalQty);

      const itemsContainer = document.getElementById('cart-items-list');
      const totalEl = document.getElementById('cart-total-price');
      if (!itemsContainer) return;

      if (cart.length === 0) {
        itemsContainer.innerHTML = `<p style="color:var(--dim);text-align:center;padding:40px 0;font-family:'JetBrains Mono',monospace;font-size:12px;">Your vault selection is empty.</p>`;
        if (totalEl) totalEl.textContent = '$0';
        return;
      }

      let subtotal = 0;
      itemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * (item.qty || 1);
        subtotal += itemTotal;
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(234,179,8,0.2);border-radius:12px;margin-bottom:10px;">
            <div>
              <div style="font-family:'Cinzel',serif;font-size:13px;color:#fff;font-weight:700;">${item.title}</div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--cyan);">$${item.price.toLocaleString()} x ${item.qty || 1}</div>
            </div>
            <button onclick="window.EpinoiaStore.removeFromCart('${item.id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:6px;font-size:14px;">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        `;
      }).join('');

      if (totalEl) totalEl.textContent = '$' + subtotal.toLocaleString();
    },

    openCart: function() {
      const drawer = document.getElementById('cart-drawer');
      const overlay = document.getElementById('cart-overlay');
      if (drawer) drawer.classList.add('open');
      if (overlay) overlay.classList.add('open');
    },

    closeCart: function() {
      const drawer = document.getElementById('cart-drawer');
      const overlay = document.getElementById('cart-overlay');
      if (drawer) drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    },

    getCurrentUser: function() {
      try {
        const raw = localStorage.getItem('eh_sanctum_buyer_account');
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },

    pendingCheckoutItems: null,
    lastInvoice: null,

    ensureStoreModals: function() {
      if (document.getElementById('eh-store-auth-modal')) return;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <!-- Store Auth Modal -->
        <div id="eh-store-auth-modal" style="position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.82);backdrop-filter:blur(10px);display:none;align-items:center;justify-content:center;padding:16px;overflow-y:auto;">
          <div style="max-width:460px;width:100%;background:rgba(10,7,24,0.96);border:1px solid rgba(234,179,8,0.45);border-radius:24px;padding:26px 22px;position:relative;color:#e2e8f0;box-shadow:0 20px 60px rgba(0,0,0,0.9);">
            <button onclick="window.EpinoiaStore.closeAuthModal()" style="position:absolute;top:16px;right:18px;background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;"><i class="fas fa-times"></i></button>
            <div style="text-align:center;margin-bottom:16px;">
              <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#22d3ee;letter-spacing:.12em;text-transform:uppercase;"><i class="fas fa-shield-halved"></i> Epinoia Buyer Protection</span>
              <h3 id="eh-store-auth-title" style="font-family:'Cinzel Decorative',serif;font-size:20px;color:#facc15;margin-top:4px;">SANCTUM ACCOUNT</h3>
            </div>
            <div id="eh-store-auth-notice" style="display:none;margin-bottom:14px;padding:10px 12px;border-radius:10px;background:rgba(234,179,8,0.14);border:1px solid rgba(234,179,8,0.4);font-size:12px;color:#fde047;line-height:1.45;">
              <i class="fas fa-lock"></i> Please <strong>Sign In</strong> or <strong>Sign Up</strong> first so your order and official invoice are securely linked to your buyer profile.
            </div>
            <div id="eh-store-auth-err" style="display:none;margin-bottom:12px;padding:10px 12px;border-radius:10px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.45);font-size:12px;color:#fca5a5;"></div>

            <div id="eh-store-tabs" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:4px;border-radius:12px;background:#030208;border:1px solid rgba(234,179,8,0.22);margin-bottom:16px;">
              <button type="button" id="eh-tab-login" onclick="window.EpinoiaStore.switchAuthTab('login')" style="padding:9px;border-radius:8px;border:none;font-family:'Cinzel',serif;font-size:11px;font-weight:700;cursor:pointer;background:#eab308;color:#000;">LOGIN</button>
              <button type="button" id="eh-tab-signup" onclick="window.EpinoiaStore.switchAuthTab('signup')" style="padding:9px;border-radius:8px;border:none;font-family:'Cinzel',serif;font-size:11px;font-weight:700;cursor:pointer;background:transparent;color:#94a3b8;">SIGN UP</button>
            </div>

            <!-- Login Form -->
            <form id="eh-form-login" onsubmit="window.EpinoiaStore.submitLogin(event)" style="display:flex;flex-direction:column;gap:12px;">
              <div>
                <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">EMAIL ADDRESS *</label>
                <input type="email" id="eh-login-email" required placeholder="you@domain.com" class="form-input">
              </div>
              <div>
                <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">PASSWORD *</label>
                <input type="password" id="eh-login-pass" required minlength="6" placeholder="••••••••" class="form-input">
              </div>
              <button type="submit" style="width:100%;padding:13px;border-radius:12px;background:linear-gradient(135deg,#eab308,#ca8a04);border:none;color:#000;font-family:'Cinzel',serif;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;">
                <i class="fas fa-right-to-bracket"></i> Sign In to Sanctum
              </button>
            </form>

            <!-- Sign Up Registration Form -->
            <form id="eh-form-signup" onsubmit="window.EpinoiaStore.submitSignup(event)" style="display:none;flex-direction:column;gap:11px;">
              <div>
                <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">FULL NAME *</label>
                <input type="text" id="eh-reg-name" required placeholder="e.g. Alexander Vance" class="form-input">
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div>
                  <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">EMAIL *</label>
                  <input type="email" id="eh-reg-email" required placeholder="you@domain.com" class="form-input">
                </div>
                <div>
                  <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">WHATSAPP / PHONE *</label>
                  <input type="tel" id="eh-reg-phone" required placeholder="+1 / +62 ..." class="form-input">
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div>
                  <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">PASSWORD *</label>
                  <input type="password" id="eh-reg-pass" required minlength="6" placeholder="Min. 6 chars" class="form-input">
                </div>
                <div>
                  <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">CONFIRM *</label>
                  <input type="password" id="eh-reg-confirm" required minlength="6" placeholder="Repeat password" class="form-input">
                </div>
              </div>
              <button type="submit" style="width:100%;padding:13px;border-radius:12px;background:linear-gradient(135deg,#eab308,#ca8a04);border:none;color:#000;font-family:'Cinzel',serif;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;margin-top:4px;">
                <i class="fas fa-user-shield"></i> Create Safe Buyer Account
              </button>
            </form>

            <!-- Logged In Profile View -->
            <div id="eh-view-profile" style="display:none;">
              <div id="eh-profile-card" style="padding:14px;border-radius:12px;background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.3);margin-bottom:14px;font-size:12px;"></div>
              <button type="button" onclick="window.EpinoiaStore.logout()" style="width:100%;padding:11px;border-radius:10px;background:rgba(239,68,68,0.16);border:1px solid rgba(239,68,68,0.45);color:#fca5a5;font-family:'Cinzel',serif;font-size:11px;font-weight:700;cursor:pointer;">
                <i class="fas fa-right-from-bracket"></i> Logout Account
              </button>
            </div>
          </div>
        </div>

        <!-- Store Safe Checkout & Invoice Modal -->
        <div id="eh-store-checkout-modal" style="position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);display:none;align-items:center;justify-content:center;padding:16px;overflow-y:auto;">
          <div style="max-width:540px;width:100%;background:rgba(10,7,24,0.97);border:1px solid rgba(234,179,8,0.5);border-radius:24px;padding:26px 22px;position:relative;color:#e2e8f0;box-shadow:0 20px 60px rgba(0,0,0,0.95);">
            <button onclick="window.EpinoiaStore.closeCheckoutModal()" style="position:absolute;top:16px;right:18px;background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;"><i class="fas fa-times"></i></button>

            <div id="eh-co-step1">
              <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#22d3ee;text-transform:uppercase;letter-spacing:.1em;"><i class="fas fa-lock"></i> Encrypted Vault Checkout</span>
              <h3 style="font-family:'Cinzel Decorative',serif;font-size:20px;color:#facc15;margin:4px 0;">AUTHORIZE VAULT ORDER</h3>
              <p style="font-size:12px;color:#94a3b8;margin-bottom:14px;">Your order is securely logged to your Epinoia Horizon account and generates an official invoice right here on screen.</p>

              <div id="eh-co-summary" style="padding:12px;border-radius:12px;background:#030208;border:1px solid rgba(234,179,8,0.25);margin-bottom:14px;font-size:12px;"></div>

              <form onsubmit="window.EpinoiaStore.submitStoreOrder(event)" style="display:flex;flex-direction:column;gap:11px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                  <div>
                    <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">BUYER FULL NAME *</label>
                    <input type="text" id="eh-co-name" required class="form-input">
                  </div>
                  <div>
                    <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">WHATSAPP / PHONE *</label>
                    <input type="tel" id="eh-co-phone" required class="form-input">
                  </div>
                </div>
                <div>
                  <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">EMAIL FOR INVOICE &amp; LICENSE *</label>
                  <input type="email" id="eh-co-email" required class="form-input">
                </div>
                <div>
                  <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">PREFERRED PAYMENT METHOD *</label>
                  <select id="eh-co-payment" class="form-select">
                    <option value="QRIS Instant (BCA / Mandiri / GoPay / OVO)">QRIS Instant (BCA / Mandiri / GoPay / OVO / Dana)</option>
                    <option value="Bank Transfer (BCA / Mandiri Official)">Bank Transfer (BCA / Mandiri Official Desk)</option>
                    <option value="International Card / PayPal / USDT">International Card / PayPal / USDT</option>
                  </select>
                </div>
                <div>
                  <label style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#cbd5e1;display:block;margin-bottom:4px;">SHIPPING ADDRESS (PENDANT) / 3D COMMISSION NOTES *</label>
                  <textarea id="eh-co-notes" rows="2" required class="form-textarea" placeholder="Full shipping address or 3D animation commission brief..."></textarea>
                </div>
                <button type="submit" style="width:100%;padding:14px;border-radius:12px;background:linear-gradient(135deg,#eab308,#ca8a04);border:none;color:#000;font-family:'Cinzel',serif;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;margin-top:4px;">
                  <i class="fas fa-file-invoice-dollar"></i> Generate Official Invoice &amp; Lock Order
                </button>
              </form>
            </div>

            <div id="eh-co-step2" style="display:none;">
              <div style="text-align:center;margin-bottom:14px;">
                <h3 style="font-family:'Cinzel Decorative',serif;font-size:20px;color:#facc15;">OFFICIAL VAULT INVOICE</h3>
                <p style="font-size:12px;color:#94a3b8;">Your order has been securely recorded in your buyer account.</p>
              </div>
              <div id="eh-co-receipt" style="padding:14px;border-radius:12px;background:#030208;border:1px solid rgba(234,179,8,0.4);font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.6;margin-bottom:14px;"></div>
              <div style="padding:11px 12px;border-radius:10px;background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.35);font-size:11px;color:#cbd5e1;line-height:1.45;margin-bottom:14px;">
                <i class="fas fa-headset" style="color:#22d3ee;"></i> <strong>Official Epinoia Horizon Admin Desk:</strong> Our verified Concierge WhatsApp is <strong style="color:#fde047;">+62 817-7634-9779</strong>.
              </div>
              <button type="button" onclick="window.EpinoiaStore.sendInvoiceWA()" style="width:100%;padding:13px;border-radius:12px;background:linear-gradient(90deg,#16a34a,#15803d);border:1px solid rgba(74,222,128,0.4);color:#fff;font-family:'Cinzel',serif;font-size:11px;font-weight:700;text-transform:uppercase;cursor:pointer;margin-bottom:8px;">
                <i class="fab fa-whatsapp"></i> Forward Invoice Copy to Admin Desk (+62 817-7634-9779)
              </button>
              <button type="button" onclick="window.EpinoiaStore.closeCheckoutModal()" style="width:100%;padding:11px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(234,179,8,0.3);color:#fde047;font-family:'Cinzel',serif;font-size:11px;font-weight:700;text-transform:uppercase;cursor:pointer;">
                Done &amp; Close
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(wrapper);
    },

    renderHeaderAuthButtons: function() {
      const actions = document.querySelector('.header-actions');
      if (!actions) return;
      let slot = document.getElementById('eh-store-auth-slot');
      if (!slot) {
        slot = document.createElement('div');
        slot.id = 'eh-store-auth-slot';
        slot.style.display = 'inline-flex';
        slot.style.alignItems = 'center';
        slot.style.gap = '8px';
        actions.insertBefore(slot, actions.firstChild);
      }
      const user = this.getCurrentUser();
      if (user && user.email) {
        slot.innerHTML = `
          <button onclick="window.EpinoiaStore.openAuthModal('profile')" class="btn-cart" style="border-color:rgba(34,211,238,0.45);color:#a5f3fc;">
            <span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;"></span>
            <span>${user.name || user.email.split('@')[0]}</span>
          </button>
        `;
      } else {
        slot.innerHTML = `
          <button onclick="window.EpinoiaStore.openAuthModal('login')" class="btn-cart">
            <i class="fas fa-right-to-bracket" style="color:var(--cyan);"></i> <span>Login</span>
          </button>
          <button onclick="window.EpinoiaStore.openAuthModal('signup')" class="btn-buy" style="border-radius:999px;padding:8px 14px;">
            <i class="fas fa-user-plus"></i> <span>Sign Up</span>
          </button>
        `;
      }
    },

    openAuthModal: function(mode, fromCheckout) {
      this.ensureStoreModals();
      const modal = document.getElementById('eh-store-auth-modal');
      const notice = document.getElementById('eh-store-auth-notice');
      if (notice) notice.style.display = fromCheckout ? 'block' : 'none';
      this.switchAuthTab(mode || 'login');
      modal.style.display = 'flex';
    },

    closeAuthModal: function() {
      const modal = document.getElementById('eh-store-auth-modal');
      if (modal) modal.style.display = 'none';
    },

    switchAuthTab: function(mode) {
      const err = document.getElementById('eh-store-auth-err');
      if (err) err.style.display = 'none';
      const tabs = document.getElementById('eh-store-tabs');
      const fLogin = document.getElementById('eh-form-login');
      const fSignup = document.getElementById('eh-form-signup');
      const vProf = document.getElementById('eh-view-profile');
      const tLogin = document.getElementById('eh-tab-login');
      const tSignup = document.getElementById('eh-tab-signup');
      const user = this.getCurrentUser();

      if (mode === 'profile' && user) {
        tabs.style.display = 'none';
        fLogin.style.display = 'none';
        fSignup.style.display = 'none';
        vProf.style.display = 'block';
        document.getElementById('eh-profile-card').innerHTML = `
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#22d3ee;">VERIFIED SANCTUM BUYER</div>
          <div style="font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:#fff;margin-top:4px;">${user.name}</div>
          <div style="color:#94a3b8;margin-top:2px;">${user.email}</div>
          <div style="color:#fde047;margin-top:2px;">${user.phone || ''}</div>
        `;
        return;
      }

      tabs.style.display = 'grid';
      vProf.style.display = 'none';
      if (mode === 'signup') {
        fLogin.style.display = 'none';
        fSignup.style.display = 'flex';
        tSignup.style.background = '#eab308';
        tSignup.style.color = '#000';
        tLogin.style.background = 'transparent';
        tLogin.style.color = '#94a3b8';
      } else {
        fLogin.style.display = 'flex';
        fSignup.style.display = 'none';
        tLogin.style.background = '#eab308';
        tLogin.style.color = '#000';
        tSignup.style.background = 'transparent';
        tSignup.style.color = '#94a3b8';
      }
    },

    submitLogin: function(e) {
      e.preventDefault();
      const email = document.getElementById('eh-login-email').value.trim();
      const pass = document.getElementById('eh-login-pass').value;
      const dir = JSON.parse(localStorage.getItem('eh_registered_buyers_dir') || '{}');
      const found = dir[email.toLowerCase()];
      if (!found || found.password !== pass) {
        const err = document.getElementById('eh-store-auth-err');
        err.style.display = 'block';
        err.innerText = 'Account not found or invalid password. Please switch to the SIGN UP tab to create a new account.';
        return;
      }
      localStorage.setItem('eh_sanctum_buyer_account', JSON.stringify(found));
      this.renderHeaderAuthButtons();
      this.closeAuthModal();
      if (this.pendingCheckoutItems) {
        const items = this.pendingCheckoutItems;
        this.pendingCheckoutItems = null;
        this.openSafeCheckout(items);
      }
    },

    submitSignup: function(e) {
      e.preventDefault();
      const name = document.getElementById('eh-reg-name').value.trim();
      const email = document.getElementById('eh-reg-email').value.trim();
      const phone = document.getElementById('eh-reg-phone').value.trim();
      const pass = document.getElementById('eh-reg-pass').value;
      const conf = document.getElementById('eh-reg-confirm').value;
      if (pass !== conf) {
        const err = document.getElementById('eh-store-auth-err');
        err.style.display = 'block';
        err.innerText = 'Password confirmation does not match.';
        return;
      }
      const buyer = { id: 'EH-' + Date.now(), name, email, phone, password: pass };
      const dir = JSON.parse(localStorage.getItem('eh_registered_buyers_dir') || '{}');
      dir[email.toLowerCase()] = buyer;
      localStorage.setItem('eh_registered_buyers_dir', JSON.stringify(dir));
      localStorage.setItem('eh_sanctum_buyer_account', JSON.stringify(buyer));
      this.renderHeaderAuthButtons();
      this.closeAuthModal();
      if (this.pendingCheckoutItems) {
        const items = this.pendingCheckoutItems;
        this.pendingCheckoutItems = null;
        this.openSafeCheckout(items);
      }
    },

    logout: function() {
      localStorage.removeItem('eh_sanctum_buyer_account');
      this.renderHeaderAuthButtons();
      this.closeAuthModal();
    },

    openSafeCheckout: function(customItems) {
      const items = customItems || this.getCart();
      if (!items || items.length === 0) {
        alert('Please add items to your Vault selection first.');
        return;
      }
      this.closeCart();
      const user = this.getCurrentUser();
      if (!user || !user.email) {
        this.pendingCheckoutItems = items;
        this.openAuthModal('signup', true);
        return;
      }
      this.ensureStoreModals();
      this.pendingCheckoutItems = items;
      document.getElementById('eh-co-step1').style.display = 'block';
      document.getElementById('eh-co-step2').style.display = 'none';
      document.getElementById('eh-co-name').value = user.name || '';
      document.getElementById('eh-co-email').value = user.email || '';
      document.getElementById('eh-co-phone').value = user.phone || '';

      const total = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
      const idrTotal = (total * 16000).toLocaleString('en-US');
      document.getElementById('eh-co-summary').innerHTML = items.map(i => `
        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(234,179,8,0.15);">
          <span>${i.title} x ${i.qty || 1}</span>
          <strong style="color:#fde047;">$${i.price * (i.qty || 1)} USD</strong>
        </div>
      `).join('') + `<div style="display:flex;justify-content:space-between;padding-top:8px;color:#facc15;font-family:'JetBrains Mono',monospace;"><strong>TOTAL:</strong><strong>$${total} USD (≈ IDR ${idrTotal})</strong></div>`;

      document.getElementById('eh-store-checkout-modal').style.display = 'flex';
    },

    closeCheckoutModal: function() {
      const modal = document.getElementById('eh-store-checkout-modal');
      if (modal) modal.style.display = 'none';
    },

    submitStoreOrder: function(e) {
      e.preventDefault();
      const items = this.pendingCheckoutItems || this.getCart();
      const buyerName = document.getElementById('eh-co-name').value.trim();
      const buyerPhone = document.getElementById('eh-co-phone').value.trim();
      const buyerEmail = document.getElementById('eh-co-email').value.trim();
      const paymentMethod = document.getElementById('eh-co-payment').value;
      const buyerNotes = document.getElementById('eh-co-notes').value.trim();
      const total = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
      const idrTotal = (total * 16000).toLocaleString('en-US');
      const invoiceId = 'INV-EH-2026-' + Math.floor(1000 + Math.random() * 9000);
      const dateStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

      const ord = { invoiceId, date: dateStr, buyerName, buyerPhone, buyerEmail, paymentMethod, buyerNotes, items, total, idrTotal };
      this.lastInvoice = ord;

      const orders = JSON.parse(localStorage.getItem('eh_vault_orders') || '[]');
      orders.unshift(ord);
      localStorage.setItem('eh_vault_orders', JSON.stringify(orders));

      localStorage.setItem('epinoia_cart', '[]');
      this.updateCartUI();

      document.getElementById('eh-co-receipt').innerHTML = `
        <div style="display:flex;justify-content:space-between;border-bottom:1px dashed rgba(234,179,8,0.4);padding-bottom:6px;margin-bottom:6px;">
          <span>INVOICE: <strong style="color:#fde047;">${invoiceId}</strong></span>
          <span style="color:#22d3ee;">AUTHORIZED</span>
        </div>
        <div><strong>Buyer:</strong> ${buyerName} (${buyerPhone})</div>
        <div><strong>Email:</strong> ${buyerEmail}</div>
        <div><strong>Payment:</strong> ${paymentMethod}</div>
        <div><strong>Notes:</strong> ${buyerNotes}</div>
        <div style="border-top:1px dashed rgba(234,179,8,0.4);margin-top:6px;padding-top:6px;color:#fde047;">
          <strong>TOTAL: $${total} USD (≈ IDR ${idrTotal})</strong>
        </div>
      `;
      document.getElementById('eh-co-step1').style.display = 'none';
      document.getElementById('eh-co-step2').style.display = 'block';
    },

    sendInvoiceWA: function() {
      if (!this.lastInvoice) return;
      const o = this.lastInvoice;
      const lines = o.items.map(i => `- ${i.title} x ${i.qty || 1}: $${i.price * (i.qty || 1)} USD`).join('\n');
      const msg = encodeURIComponent(
        `Hello Epinoia Horizon Official Admin Desk (+62 817-7634-9779),\n\n` +
        `Official Website Invoice Confirmation:\n` +
        `Invoice ID: ${o.invoiceId}\n` +
        `Buyer: ${o.buyerName} (${o.buyerPhone})\n` +
        `Email: ${o.buyerEmail}\n` +
        `Payment Method: ${o.paymentMethod}\n\n` +
        `Ordered Items:\n${lines}\n` +
        `Total Amount: $${o.total} USD (≈ IDR ${o.idrTotal})\n\n` +
        `Shipping / Commission Notes:\n${o.buyerNotes}`
      );
      window.open(`https://wa.me/6281776349779?text=${msg}`, '_blank');
    }
  };

  // Init cart badge & header auth buttons on page load
  document.addEventListener('DOMContentLoaded', function() {
    try { localStorage.removeItem('epinoia_admin_auth'); } catch (e) {}
    const devLink = document.getElementById('dev-admin-nav-link');
    if (devLink) {
      devLink.style.display = (sessionStorage.getItem('epinoia_dev_admin_session') === 'verified') ? 'inline-flex' : 'none';
    }
    window.EpinoiaStore.updateCartUI();
    window.EpinoiaStore.renderHeaderAuthButtons();
  });
})();
