# PowerShell script to download city images from Unsplash
# Cities 4-15 (excluding first 3: San Diego, Los Angeles, San Francisco)

$cities = @(
    @{ Name = "San Jose"; SearchTerm = "san jose california silicon valley tech"; Filename = "san-jose-silicon-valley-new.jpg" },
    @{ Name = "Santa Barbara"; SearchTerm = "santa barbara california american riviera beach"; Filename = "santa-barbara-american-riviera-new.jpg" },
    @{ Name = "Napa Valley"; SearchTerm = "napa valley california wine country vineyards"; Filename = "napa-valley-wine-country-new.jpg" },
    @{ Name = "Santa Monica"; SearchTerm = "santa monica california beach pier oceanfront"; Filename = "santa-monica-beach-pier-new.jpg" },
    @{ Name = "Malibu"; SearchTerm = "malibu california coastline beach celebrity"; Filename = "malibu-coastline-beach-new.jpg" },
    @{ Name = "San Mateo"; SearchTerm = "san mateo california peninsula bay area"; Filename = "san-mateo-peninsula-new.jpg" },
    @{ Name = "Redwood City"; SearchTerm = "redwood city california downtown peninsula"; Filename = "redwood-city-downtown-new.jpg" },
    @{ Name = "Palm Springs"; SearchTerm = "palm springs california desert mountains mid century"; Filename = "palm-springs-desert-mountains-new.jpg" },
    @{ Name = "Orange"; SearchTerm = "orange california old towne historic architecture"; Filename = "orange-old-towne-new.jpg" },
    @{ Name = "Ventura"; SearchTerm = "ventura california beach coastline surf"; Filename = "ventura-beach-coastline-new.jpg" },
    @{ Name = "Santa Rosa"; SearchTerm = "santa rosa california wine country sonoma"; Filename = "santa-rosa-wine-country-new.jpg" },
    @{ Name = "Sonoma"; SearchTerm = "sonoma california plaza wine country historic"; Filename = "sonoma-plaza-wine-country-new.jpg" }
)

$publicDir = Join-Path $PSScriptRoot ".." "public"

Write-Host "Starting to download city images..." -ForegroundColor Green
Write-Host ""

foreach ($city in $cities) {
    try {
        $searchQuery = [System.Web.HttpUtility]::UrlEncode($city.SearchTerm)
        # Using Unsplash Source API
        $imageUrl = "https://source.unsplash.com/1920x1080/?$searchQuery"
        
        $filepath = Join-Path $publicDir $city.Filename
        
        Write-Host "Downloading image for $($city.Name)..." -ForegroundColor Yellow
        
        # Download using Invoke-WebRequest
        $response = Invoke-WebRequest -Uri $imageUrl -UseBasicParsing -MaximumRedirection 5
        
        # Handle redirects to get the actual image URL
        $actualUrl = $response.BaseResponse.ResponseUri.AbsoluteUri
        
        # Download the actual image
        Invoke-WebRequest -Uri $actualUrl -OutFile $filepath -UseBasicParsing
        
        Write-Host "✅ Downloaded: $($city.Filename)" -ForegroundColor Green
        
        # Add delay to avoid rate limiting
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Host "❌ Error downloading $($city.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Download process completed!" -ForegroundColor Green


