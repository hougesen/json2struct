<script lang="ts" defer>
    import json2struct from 'json2struct';
    import { format } from 'prettier/standalone';
    import typescriptParser from 'prettier/parser-typescript';
    $: jsonInput = ``;

    $: convertedStruct = '';
    $: selectedLanguage = 'typescript';

    async function convert() {
        if (!jsonInput.length) {
            convertedStruct = '';
            return;
        }

        try {
            convertedStruct = json2struct(selectedLanguage, jsonInput);

            if (selectedLanguage === 'typescript') {
                convertedStruct = format(convertedStruct, { parser: 'typescript', plugins: [typescriptParser] });
            }
        } catch (error) {
            console.error('error', error);
            convertedStruct = 'ERROR: Invalid JSON';
        }
    }
</script>

<div class="container mx-auto p-8">
    <div class="flex items-center gap-4 xl:gap-8 mb-4">
        <h1 class="text-4xl lg:text-5xl font-bold">json2struct</h1>

        <a href="https://github.com/hougesen/json2struct" rel="noreferrer noopener" target="_blank">
            <svg
                viewBox="0 0 244 261"
                xmlns="http://www.w3.org/2000/svg"
                class="rounded p-2 bg-black dark:bg-white text-white dark:text-black h-12 w-12"
            >
                <path
                    d="M243.63 95.84a72.192 72.192 0 0 0-16.074-45.137 72.803 72.803 0 0 0-3.133-43.902 9.685 9.685 0 0 0-6.105-5.602c-3.922-1.343-18.762-3.863-49 15.734v.004a146.064 146.064 0 0 0-39.871-4.816 146.174 146.174 0 0 0-39.93 4.816C58.494-3.11 42.365.137 39.119 1.089A9.803 9.803 0 0 0 33.013 6.8a72.795 72.795 0 0 0-3.246 43.793 68.405 68.405 0 0 0-16.016 45.47c0 61.937 35.445 80.64 67.926 87.25a52.344 52.344 0 0 0-3.414 12.71 5.61 5.61 0 0 0 0 1.403v17.133c-29.566 2.464-35.895-14.84-36.512-16.801v.003a13.016 13.016 0 0 0-.508-1.347 49.56 49.56 0 0 0-28-24.918C8.11 169.781 2.555 172.55.841 177.683c-1.715 5.133 1.055 10.688 6.188 12.406a29.616 29.616 0 0 1 15.906 13.605c3.922 12.711 19.938 32.816 55.215 30.574v16.13a9.801 9.801 0 0 0 19.601 0V198.15a28.008 28.008 0 0 1 7.11-15.289 9.742 9.742 0 0 0-5.598-16.8c-34.16-3.977-65.742-15.23-65.742-70.391h-.004a48.18 48.18 0 0 1 14.336-35.953 10.411 10.411 0 0 0 2.242-10.414 48.54 48.54 0 0 1-.617-29.68 85.173 85.173 0 0 1 33.094 15.512 10.033 10.033 0 0 0 8.625 1.176 121.025 121.025 0 0 1 38.418-5.207 120.682 120.682 0 0 1 38.36 5.207 9.977 9.977 0 0 0 8.624-1.176 87.994 87.994 0 0 1 31.695-15.402 49.534 49.534 0 0 1-.73 29.96 9.695 9.695 0 0 0 1.906 9.52 54.555 54.555 0 0 1 14.727 36.457c0 55.047-33.207 66.473-65.742 70.391a9.751 9.751 0 0 0-8.336 7.16 9.752 9.752 0 0 0 3.633 10.371c3.472 2.633 7.504 10.023 7.504 22.398v44.352c0 5.415 4.386 9.801 9.797 9.801a9.789 9.789 0 0 0 6.93-2.87 9.794 9.794 0 0 0 2.87-6.93V205.99a59.718 59.718 0 0 0-4.199-22.793c26.32-5.597 66.977-22.902 66.977-87.359l-.001.002Z"
                    fill="currentColor"
                />
            </svg>
        </a>
    </div>

    <h2 class="text-2xl">Easily translate JSON into type declarations.</h2>

    <div class="mt-4 flex flex-col gap-4 h-full">
        <div class="flex gap-4">
            <select bind:value={selectedLanguage} class="text-black ml-auto px-3 p-2 rounded" on:change={convert}>
                <option value="typescript"> TypeScript </option>
                <option value="python"> Python </option>
                <option value="julia"> Julia </option>
                <option value="rust"> Rust </option>
            </select>

            <button on:click={convert} type="button" class="rounded border-2 border-white p-2 px-4"> Convert </button>
        </div>

        <div class="pb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <textarea bind:value={jsonInput} class="w-full h-full p-4 text-black bg-white min-h-[60vh] rounded" />

            <pre
                class="w-full h-full overflow-auto p-4 text-black bg-white min-h-[60vh] rounded">{convertedStruct}</pre>
        </div>
    </div>
</div>
