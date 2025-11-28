<script>
  import "../app.css";
  import security from "$lib/assets/security.svg";
  import source from "$lib/assets/source.svg";
  import email from "$lib/assets/email.svg";
  import { inject } from "@vercel/analytics";
  import { dev } from "$app/environment";
  import Modal from "$lib/Modal.svelte";

  inject({ mode: dev ? "development" : "production" });

  const securitySummary =
    "End-to-end encrypted notes and optional image attachments (AES-256-GCM, PBKDF2 or OTP) with single-use links, salted hashing, and strict platform headers.";

  const securityBullets = [
    "Client-side encryption only; servers never see plaintext or derived keys.",
    "PBKDF2 (100k) password derivation plus salted SHA-256 hashes with constant-time comparison.",
    "Attachments: PNG/JPEG/WEBP/GIF up to ~1MB, encrypted together with the note.",
    "Ephemeral storage: links can be single-view and are deleted on read or expiry.",
    "Runtime hardening: CSP, HSTS, permissions lockdown, and origin-locked CSRF checks.",
  ];

  let showSecurity = false;
</script>

<svelte:head>
  <title>vanish.so - secure vanishing notes</title>
  <meta
    name="description"
    content="open source end-to-end encrypted vanishing notes"
  />

  <meta property="og:url" content="https://www.vanish.so/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="vanish.so - secure vanishing notes" />
  <meta
    property="og:description"
    content="open source end-to-end encrypted vanishing notes"
  />
  <meta property="og:image" content="https://www.vanish.so/og.png" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="vanish.so" />
  <meta property="twitter:url" content="https://www.vanish.so/" />
  <meta name="twitter:title" content="vanish.so - secure vanishing notes" />
  <meta
    name="twitter:description"
    content="open source end-to-end encrypted vanishing notes"
  />
  <meta name="twitter:image" content="https://www.vanish.so/og.png" />
</svelte:head>
<main
  class="w-screen h-screen overflow-hidden flex flex-col items-center relative"
>
  <div
    class="absolute mx-auto bg-[#6F32F0]/25 w-[40rem] rounded-[50%] h-[10rem] blur-[100px] -top-48 -z-10"
  />
  <div
    class="absolute mx-auto bg-[#6F32F0] w-[40rem] rounded-[50%] h-[10rem] blur-[200px] -bottom-96 -z-10"
  />
  <div class="flex items-center justify-between w-full max-w-5xl my-6 px-10">
    <a href="/" data-sveltekit-reload>
      <h1 class="font-semibold text-white font-clash text-2xl">
        vanish<span class="text-[#BCA4F5]/30">.</span><span
          class="text-[#8F69FA]">so</span
        >
      </h1>
    </a>
    <div class="flex items-center gap-6 text-primary font-medium text-sm">
      <button
        type="button"
        class="flex gap-2 items-center"
        on:click={() => (showSecurity = true)}
        aria-haspopup="dialog"
        aria-expanded={showSecurity}
      >
        <img class="h-4 w-4" alt="security icon" src={security} />
        <p class="hover:text-white transition-colors hidden sm:block">
          security
        </p>
      </button>
      <a
        href="https://github.com/bvvst/vanishso"
        class="flex gap-2 items-center"
        target="_blank"
        rel="noreferrer noopener"
      >
        <img class="h-4 w-4" alt="source icon" src={source} />
        <p class="hover:text-white transition-colors hidden sm:block">
          source code
        </p>
      </a>
      <a
        href="https://github.com/bvvst/vanishso/issues"
        class="flex gap-2 items-center"
        target="_blank"
        rel="noreferrer noopener"
      >
        <img class="h-4 w-4" alt="email icon" src={email} />
        <p class="hover:text-white transition-colors hidden sm:block">
          contact
        </p>
      </a>
    </div>
  </div>
  <slot />
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7783535633029345"
    crossorigin="anonymous"
  ></script>
  <!-- r -->
  <ins
    class="adsbygoogle"
    style="display:block"
    data-ad-client="ca-pub-7783535633029345"
    data-ad-slot="6198772991"
    data-ad-format="auto"
    data-full-width-responsive="true"
  />
  <script>
    (adsbygoogle = window.adsbygoogle || []).push({});
  </script>

  {#if showSecurity}
    <div
      class="fixed inset-0 z-30 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Security summary"
      on:click={() => (showSecurity = false)}
    >
      <div
        class="max-w-xl w-full"
        on:click|stopPropagation
      >
        <Modal>
          <svelte:fragment slot="header">
            <div class="flex flex-col gap-2 text-center">
              <h2 class="text-white font-clash font-semibold text-xl">
                Security at a glance
              </h2>
              <p class="text-primary font-geist text-sm font-medium leading-relaxed">
                {securitySummary}
              </p>
            </div>
          </svelte:fragment>
          <svelte:fragment slot="content">
            <ul class="list-disc list-inside space-y-2 text-primary text-sm font-geist">
              {#each securityBullets as item}
                <li class="text-white/90">{item}</li>
              {/each}
            </ul>
            <button
              type="button"
              class="purple-button bg-orchid hover:bg-orchid-100 px-3.5 mt-4 text-sm text-white font-semibold active:translate-y-[2px] transition rounded-lg py-2 w-full"
              on:click={() => (showSecurity = false)}
            >
              Close
            </button>
          </svelte:fragment>
        </Modal>
      </div>
    </div>
  {/if}
</main>
