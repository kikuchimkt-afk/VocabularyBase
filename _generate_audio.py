"""
edge-tts バッチ音声生成スクリプト（リトライ＆ディレイ付き）
"""
import asyncio
import json
import os
import sys
import edge_tts

# 設定
WORDLIST_FILE = sys.argv[1] if len(sys.argv) > 1 else "public/wordlist_5kyu.json"
OUTPUT_DIR = sys.argv[2] if len(sys.argv) > 2 else "public/audio/5kyu"
VOICE = "en-US-JennyNeural"
RATE = sys.argv[3] if len(sys.argv) > 3 else "-20%"
MAX_RETRIES = 3
DELAY_BETWEEN = 0.3  # 秒間ディレイ

async def generate_audio(text, output_path, voice=VOICE, rate=RATE):
    """edge-ttsで音声ファイルを生成（リトライ付き）"""
    if os.path.exists(output_path) and os.path.getsize(output_path) > 100:
        return "skip"
    for attempt in range(MAX_RETRIES):
        try:
            communicate = edge_tts.Communicate(text, voice, rate=rate)
            await communicate.save(output_path)
            if os.path.exists(output_path) and os.path.getsize(output_path) > 100:
                return "ok"
            else:
                raise Exception("Empty file generated")
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                wait = 2 * (attempt + 1)
                await asyncio.sleep(wait)
            else:
                print(f"  ❌ Failed after {MAX_RETRIES} retries: {text[:30]}... - {e}")
                return "fail"
    return "fail"

async def main():
    with open(WORDLIST_FILE, "r", encoding="utf-8") as f:
        words = json.load(f)
    
    print(f"📚 Wordlist: {WORDLIST_FILE}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"🔊 Voice: {VOICE}, Rate: {RATE}")
    print(f"📝 Total: {len(words)} words")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    existing = len([f for f in os.listdir(OUTPUT_DIR) if f.endswith('.mp3')])
    print(f"✅ Already exists: {existing} files\n")
    
    success = 0
    failed = 0
    skipped = 0
    
    for i, word in enumerate(words):
        rank = word["rank"]
        english = word.get("word") or word.get("english", "")
        example = word.get("example", "")
        
        # 単語音声
        word_path = os.path.join(OUTPUT_DIR, f"{rank}_word.mp3")
        result = await generate_audio(english, word_path)
        if result == "ok": success += 1
        elif result == "skip": skipped += 1
        else: failed += 1
        
        await asyncio.sleep(DELAY_BETWEEN)
        
        # 例文音声
        if example:
            example_path = os.path.join(OUTPUT_DIR, f"{rank}_example.mp3")
            result = await generate_audio(example, example_path)
            if result == "ok": success += 1
            elif result == "skip": skipped += 1
            else: failed += 1
            
            await asyncio.sleep(DELAY_BETWEEN)
        
        # 進捗表示
        if (i + 1) % 50 == 0 or (i + 1) == len(words):
            total_files = success + skipped
            print(f"  [{i+1}/{len(words)}] ✅{success} new, ⏭️{skipped} skip, ❌{failed} fail")
    
    total = len(os.listdir(OUTPUT_DIR))
    print(f"\n🎉 Complete! {total} files in {OUTPUT_DIR}")
    print(f"   New: {success}, Skipped: {skipped}, Failed: {failed}")

if __name__ == "__main__":
    asyncio.run(main())
