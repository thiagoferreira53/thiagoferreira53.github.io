'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "8b2fa195225c28d5831ce1fac3ec10f4",
"assets/AssetManifest.bin.json": "beb6fb506180db387d10a5da946048de",
"assets/AssetManifest.json": "20fc4718393dd2be09677fa8248595e9",
"assets/assets/ASHRAE901_nao_residencial.json": "710cb6a1adae404a022bfe6a34f4d82f",
"assets/assets/ASHRAE901_residencial.json": "aed11f5bca0e444488a4f063e0c90dee",
"assets/assets/componentes.json": "cccbabd2a417d2a8915ec5b59326e0a2",
"assets/assets/images/1.png": "ac664e1db9947ba2139f535809bc570a",
"assets/assets/images/2.png": "109a2a84e03061b402487481b4875020",
"assets/assets/images/3.png": "cd99abbb9cd803febfb62366ebbb5fed",
"assets/assets/images/4.png": "91a0f0f46c3f3578153f251543868520",
"assets/assets/images/barchart.png": "beebbc4c2fe36f76f0b7c174835c7fbb",
"assets/assets/images/calculator.png": "ef350aa4db3b850378c9561608bc7b74",
"assets/assets/images/camada01.png": "a14bba0db2e4beda37425811f86b374d",
"assets/assets/images/camada02.png": "c04a5a791d6e5a53aa0bdb514bdff5b4",
"assets/assets/images/camada03.png": "741047b9ab128f74f0622e8497f56c8f",
"assets/assets/images/file.png": "6293ebead053f09479a7207027dc581c",
"assets/assets/images/historical.png": "f89212766fcd2f6464960c17ac36069b",
"assets/assets/images/life_logo.jpg": "574da7973b2bfff0bb5c4a7535c7f4e7",
"assets/assets/images/logo2.png": "4437f54563daac67cf1516db9346f186",
"assets/assets/images/logo2_.png": "cf8ad367417331a4903bfcf8bdd1d616",
"assets/assets/images/logo2_semfundo.png": "2012565aefa280e3c6c7052baf6bcc65",
"assets/assets/images/logo_life.png": "c8a767f42178d4c771707facf4473c09",
"assets/assets/images/logo_life.xcf": "ae5f228d35fe6bc8e0e4eebb3216a0c6",
"assets/assets/images/logo_life_.png": "e72d583780bd907dc9e3b97de6f68d7a",
"assets/assets/images/ppgci.png": "5c248fa0ac7fb3d1d37d6b2a5689d3c1",
"assets/assets/images/show.png": "f1e2ef29b5d8bbf22101d11163cd1ce8",
"assets/assets/images/trash.png": "55f1a5f70574ba4d9e1537e9a10840fc",
"assets/assets/images/ufrgs.jpg": "718cca1949c0904db2f6f674faa0f04f",
"assets/assets/images/ufrgs.jpg.webp": "57d202ea597ee2c20448e219b2296e6b",
"assets/assets/images/ufrgs_.png": "b41600f353fc1602e5ba8f26c7ce4665",
"assets/assets/images/zb_internacionais.png": "d13e272d33339dbfa75300684a94dba2",
"assets/assets/images/zb_nacionais.png": "9dd31851a76c0d0e98ce35f05ede60d6",
"assets/assets/logo_life.png": "c8a767f42178d4c771707facf4473c09",
"assets/assets/logo_ppgci.png": "5c248fa0ac7fb3d1d37d6b2a5689d3c1",
"assets/assets/logo_ufrgs.png": "b41600f353fc1602e5ba8f26c7ce4665",
"assets/assets/NBR15575.json": "8be613bd4f23e11cda61946e64ee6b19",
"assets/assets/RTQC.json": "01d436fe6e9b0c873d7bbaa4e7e2d94b",
"assets/assets/RTQR.json": "bcda05a560c67bd0699948928a99aac0",
"assets/assets/sistemas.json": "831b1eabf6f34b1862cd66b24e26f697",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "e684ff0a009c82cdc731d2316e3e817d",
"assets/NOTICES": "fe15b003c4a75e27a2927d8e42e1e0df",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "c86fbd9e7b17accae76e5ad116583dc4",
"canvaskit/canvaskit.js.symbols": "38cba9233b92472a36ff011dc21c2c9f",
"canvaskit/canvaskit.wasm": "3d2a2d663e8c5111ac61a46367f751ac",
"canvaskit/chromium/canvaskit.js": "43787ac5098c648979c27c13c6f804c3",
"canvaskit/chromium/canvaskit.js.symbols": "4525682ef039faeb11f24f37436dca06",
"canvaskit/chromium/canvaskit.wasm": "f5934e694f12929ed56a671617acd254",
"canvaskit/skwasm.js": "445e9e400085faead4493be2224d95aa",
"canvaskit/skwasm.js.symbols": "741d50ffba71f89345996b0aa8426af8",
"canvaskit/skwasm.wasm": "e42815763c5d05bba43f9d0337fa7d84",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter.js": "c71a09214cb6f5f8996a531350400a9a",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "e9cab59227818311ed6e0d807f9081b8",
"/": "e9cab59227818311ed6e0d807f9081b8",
"main.dart.js": "7bc4801bb12386da06da27bf08d8083b",
"manifest.json": "cf7189b2ed8f5082e4ef2b70c350ac0f",
"version.json": "ec64ba13083ccf0f359163a355587c67"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
