import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const movieUrl = searchParams.get('movieUrl');

    if (!movieUrl) {
        return NextResponse.json({ error: "Movie URL is required" }, { status: 400 });
    }

    try {
        // Fetch the movie page
        const { data } = await axios.get(movieUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
            }
        });

        // Load the HTML into Cheerio
        const $ = cheerio.load(data);

        // ✅ Find the iframe source (video player)
        const iframeSrc = $('iframe').attr('src');

        if (!iframeSrc) {
            return NextResponse.json({ error: "No iframe found" }, { status: 404 });
        }

        return NextResponse.json({ iframeUrl: iframeSrc });

    } catch (error) {
        console.error("Error fetching iframe:", error);
        return NextResponse.json({ error: "Stream not available" }, { status: 500 });
    }
}
