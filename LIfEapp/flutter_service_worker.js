'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "69e1fd86256cd8c35df1375124c8c9bd",
"assets/AssetManifest.bin.json": "9ed7eb2c3ae4bc2ac0446a49d78d8e06",
"assets/AssetManifest.json": "1ae2ece287b207c56d7991596d605180",
"assets/assets/icons/embreve.png": "e41e552291644f4ca6ac7a4833453b5c",
"assets/assets/icons/life_logo.jpg": "574da7973b2bfff0bb5c4a7535c7f4e7",
"assets/assets/icons/TGD_logo.png": "5e8a97fdab36f91352a5d0dde8b79059",
"assets/assets/icons/TGD_logo2.png": "d86e10c2629be00e4a8b78841cdb9ee7",
"assets/assets/icons/TGD_title.png": "cfe849b508b6ac8c5003108d429de7f3",
"assets/assets/images/1.png": "ac664e1db9947ba2139f535809bc570a",
"assets/assets/images/2.png": "109a2a84e03061b402487481b4875020",
"assets/assets/images/3.png": "cd99abbb9cd803febfb62366ebbb5fed",
"assets/assets/images/4.png": "91a0f0f46c3f3578153f251543868520",
"assets/assets/images/barchart.png": "aa2de7f17924502a29d6e16dfbbf1ca9",
"assets/assets/images/calculator.png": "ef350aa4db3b850378c9561608bc7b74",
"assets/assets/images/camada01.png": "3fcf89247a8904eafd7e2a09fca82b76",
"assets/assets/images/camada02.png": "e6628776e516692080aa14080da91e07",
"assets/assets/images/camada03.png": "8c0ef4de356cb5e47af6c5a57251de3d",
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
"assets/assets/regulations/ASHRAE901_nao_residencial.json": "710cb6a1adae404a022bfe6a34f4d82f",
"assets/assets/regulations/ASHRAE901_residencial.json": "aed11f5bca0e444488a4f063e0c90dee",
"assets/assets/regulations/cladding_systems.json": "0ca401f4aaa04e4f50ce668a0dfdb723",
"assets/assets/regulations/cladding_systemsv2.json": "831b1eabf6f34b1862cd66b24e26f697",
"assets/assets/regulations/cladding_systemsv3.json": "831b1eabf6f34b1862cd66b24e26f697",
"assets/assets/regulations/components_impact.json": "de0f10cf1598a7cd188823056096509f",
"assets/assets/regulations/NBR15575.json": "8be613bd4f23e11cda61946e64ee6b19",
"assets/assets/regulations/RTQC.json": "01d436fe6e9b0c873d7bbaa4e7e2d94b",
"assets/assets/regulations/RTQR.json": "bcda05a560c67bd0699948928a99aac0",
"assets/assets/regulations/teste.txt": "ba32388cfe5316545d276dfae7c1668a",
"assets/assets/systems/sistema1.png": "a1998c097a9323691b94fbab5c05b874",
"assets/assets/systems/sistema10.png": "4c3ca3531265ad9ecf8899b3029a0e9b",
"assets/assets/systems/sistema11.png": "8146c437222b9258b0fa6e5fee6f9347",
"assets/assets/systems/sistema12.png": "4b2b53de5dd59be6063d5909719e58a1",
"assets/assets/systems/sistema13.png": "991522ac3362a9fc22c186d8c9c76030",
"assets/assets/systems/sistema14.png": "d8f0456778dbbbb44d9818b0df9524f6",
"assets/assets/systems/sistema15.png": "5477ae284cbad4f98fd645c0ad98f241",
"assets/assets/systems/sistema16.png": "7c0847ec220922b5648878a7db0efca2",
"assets/assets/systems/sistema17.png": "e93671b405e1cacf32cba6b9695cba79",
"assets/assets/systems/sistema18.png": "be389182a5871d35faf75eae358446ea",
"assets/assets/systems/sistema19.png": "05ae3c8a981387827ba4e9c3fdde1c66",
"assets/assets/systems/sistema2.png": "f3db5f162d7d34ea5b5844c32ff88a72",
"assets/assets/systems/sistema20.png": "5f5e3f4830367105ac4399226be8d134",
"assets/assets/systems/sistema21.png": "5686d4d470cc698b48ec383c7bc97e8f",
"assets/assets/systems/sistema22.png": "ecfc98e04bb301c4d76311038b998c96",
"assets/assets/systems/sistema23.png": "1be9ae6bcd1020efa9831f933b22b923",
"assets/assets/systems/sistema24.png": "1217ed4f9a17696f54a115a3aa4d6c87",
"assets/assets/systems/sistema25.png": "26aebea0d3322ffaddc8824a684db452",
"assets/assets/systems/sistema26.png": "2850f2a4288e963e67820937c32910d3",
"assets/assets/systems/sistema27.png": "3afa8abcd9c5636bfeee9b65501ec470",
"assets/assets/systems/sistema28.png": "d91b67c546b43d576d3465ef6917e83b",
"assets/assets/systems/sistema29.png": "2c8c1787c9ca48c465b06731d8978b35",
"assets/assets/systems/sistema3.png": "5fea847985e2014aa44105251cb6f0eb",
"assets/assets/systems/sistema30.png": "4f8194fda8526985394858f9ce86118a",
"assets/assets/systems/sistema31.png": "4a53992b8a35d235cd4d3ac2c2c1e13d",
"assets/assets/systems/sistema32.png": "f0fe0a4dbded81b4317170bfa43baef3",
"assets/assets/systems/sistema33.png": "0c22032162b44e400b181b16d6a10069",
"assets/assets/systems/sistema34.png": "4e3ab3316fd8f9413197dea60fb70836",
"assets/assets/systems/sistema35.png": "b8b549113a8aa7483a196408f2eb545b",
"assets/assets/systems/sistema36.png": "cb264700ff7e2e3180aa36c1a40d60c1",
"assets/assets/systems/sistema37.png": "af41166fee97f6269ba4de2cba21b396",
"assets/assets/systems/sistema38.png": "623bc2508e8ebeb305a5e4bf90e291cd",
"assets/assets/systems/sistema39.png": "85f1d1db5490452d624362a80c7b2ccd",
"assets/assets/systems/sistema4.png": "204ff7e6a4a92f502d77ddd72f23a2f3",
"assets/assets/systems/sistema40.png": "4036223d6097ce0b52af05e1f2fa8a3c",
"assets/assets/systems/sistema41.png": "9cbe46a32b7701cf9e26cd939b3e36d1",
"assets/assets/systems/sistema42.png": "0a02b6adf0732e46c4adaa1836585924",
"assets/assets/systems/sistema5.png": "2453bf9596013a5df720db1b1ebf6505",
"assets/assets/systems/sistema6.png": "602e9fd2a4e7ffcf2f5d81ae235536e6",
"assets/assets/systems/sistema7.png": "129b59dd2fe39d36900257d19f106be3",
"assets/assets/systems/sistema8.png": "9b4bda8b99eee22d0835a61d3267ae49",
"assets/assets/systems/sistema9.png": "08f1326db26e54f87f5d0bedb96358f0",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "fd708ef1999173a410716253f058ceda",
"assets/NOTICES": "e927ebdfcb320007408f6a686abcf5af",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89ed8f4e49bcdfc0b5bfc9b24591e347",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "c86fbd9e7b17accae76e5ad116583dc4",
"canvaskit/canvaskit.js.symbols": "38cba9233b92472a36ff011dc21c2c9f",
"canvaskit/canvaskit.wasm": "3d2a2d663e8c5111ac61a46367f751ac",
"canvaskit/chromium/canvaskit.js": "43787ac5098c648979c27c13c6f804c3",
"canvaskit/chromium/canvaskit.js.symbols": "4525682ef039faeb11f24f37436dca06",
"canvaskit/chromium/canvaskit.wasm": "f5934e694f12929ed56a671617acd254",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
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
"index.html": "083c3c6a62806b6b7a55c5e8fbbb85e6",
"/": "083c3c6a62806b6b7a55c5e8fbbb85e6",
"main.dart.js": "8c26e9bce97bc8e95b05461fd3fd47c6",
"manifest.json": "7c8b6913e2207f917e9b2e927aa7254d",
"version.json": "8ecb897e4dcfbed41cf19470ba482c9e"};
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
