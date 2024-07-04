import puppeteer from "puppeteer";
import fs from "fs";

let quotesData = []

const getQuotes = async () => { 
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
    })

    let url = "http://quotes.toscrape.com/"
    const page = await browser.newPage()

    while(url) {
        console.log(url)
        await page.setDefaultNavigationTimeout(0);
        await page.goto(url, {
            waitUntil: "domcontentloaded",
        })
        
        const quotes = await page.evaluate(() => {
            const quoteList = document.querySelectorAll(".quote")
    
            return Array.from(quoteList).map(quote => {            
                const text = quote.querySelector(".text").innerText
                const author = quote.querySelector(".author").innerText
                
                return { text, author}
            })
        })
    
        quotesData.push(...quotes)

        //Query first element with outlined specifications
        const nextButton = await page.$(".pager > .next > a")
        if(nextButton) {
            url = await page.evaluate(() => document.querySelector(".pager > .next > a").href)
        } else {
            console.log("All pages scraped");
            url = null
        }
    }

    const storeData = (data) => {
        fs.writeFile("data.json", JSON.stringify(data), (err) => {
            if (err) throw err;
            console.log("Data saved to data.json");
        })
    }
    storeData(quotesData)

    await browser.close()
}


getQuotes()
