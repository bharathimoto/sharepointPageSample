Add-PSSnapin "Microsoft.SharePoint.PowerShell"

function ExportRollupAnalyticsData {
    Param(
    [string]$RootSiteUrl,
    [string]$Scope,
    [switch]$IncludeSites,
    [switch]$IncludeWebs,
    [string]$OutputFilePath
    )

    # Delete CSV file if existing
    If (Test-Path $OutputFilePath) {
	    Remove-Item $OutputFilePath
    }

    # Write header row to CSV File
    $OutputHeader = "Scope,Name,URL,Most Recent Day with Usage,Hits - All Time,Unique Users - All Time,Hits - Most Recent Day with Usage,Unique Users - Most Recent Day with Usage,Current Date"
    $OutputHeader | Out-File $OutputFilePath -Append 

    # Get Web Application for Root Site
    $RootSite = Get-SPSite $RootSiteUrl
    $WebApp = $rootSite.WebApplication 

    # Get Search Service Application
    $SearchApp = Get-SPEnterpriseSearchServiceApplication

    # Loop through all Site Collections in Web Application
    ForEach($Site in $WebApp.Sites) {    
        
        # Export Site analtyics if -IncludeSites flag is present
        If ($IncludeSites.IsPresent) {
            $Scope = "Site"
            $SiteTitle = $Site.RootWeb.Title.Replace(",", "")
            $SiteUrl = $Site.Url
            $UsageData = $SearchApp.GetRollupAnalyticsItemData(1,[System.Guid]::Empty,$Site.ID,[System.Guid]::Empty)
            $LastProcessingTime = $UsageData.LastProcessingTime
            $CurrentDate = $UsageData.CurrentDate
            $TotalHits = $UsageData.TotalHits
            $TotalUniqueUsers = $UsageData.TotalUniqueUsers
            $LastProcessingHits = $UsageData.LastProcessingHits
            $LastProcessingUniqueUsers = $UsageData.LastProcessingUniqueUsers

            # Write Web details to CSV File
            $OutputString = $Scope + "," + $SiteTitle + "," + $SiteUrl + "," + $LastProcessingTime + "," + $TotalHits + "," + $TotalUniqueUsers + "," + $LastProcessingHits + "," + $LastProcessingUniqueUsers + "," + $CurrentDate
            $OutputString | Out-File $OutputFilePath -Append
        }      

        # Export Web analtyics if -IncludeWebs flag is present
        If ($IncludeWebs.IsPresent) {
            
            # Loop through all Webs in Site Collection
            ForEach($Web in $Site.AllWebs) {
                $Scope = "Web"
                $WebTitle = $Web.Title.Replace(",", "")
                $WebUrl = $Web.Url
                $UsageData = $SearchApp.GetRollupAnalyticsItemData(1,[System.Guid]::Empty,$Site.ID,$Web.ID)
                $LastProcessingTime = $UsageData.LastProcessingTime
                $CurrentDate = $UsageData.CurrentDate
                $TotalHits = $UsageData.TotalHits
                $TotalUniqueUsers = $UsageData.TotalUniqueUsers
                $LastProcessingHits = $UsageData.LastProcessingHits
                $LastProcessingUniqueUsers = $UsageData.LastProcessingUniqueUsers

                # Write Web details to CSV File
                $OutputString = $Scope + "," + $WebTitle + "," + $WebUrl + "," + $LastProcessingTime + "," + $TotalHits + "," + $TotalUniqueUsers + "," + $LastProcessingHits + "," + $LastProcessingUniqueUsers + "," + $CurrentDate
                $OutputString | Out-File $OutputFilePath -Append 
            }
        }
         
        # Dispose Site Collection Object
        $Site.Dispose()
    }
}



# Sample Usage: Export both SPSite and SPWeb analytics 
ExportRollupAnalyticsData -RootSiteUrl "http://win-73c72rcrtq5:8056/" -OutputFilePath "C:\temp\analytics-export-sites-webs.csv" -IncludeSites -IncludeWebs

# Sample Usage: Export only SPSite analytics
ExportRollupAnalyticsData -RootSiteUrl "http://win-73c72rcrtq5:8056/" -OutputFilePath "C:\temp\analytics-export-sites-only.csv" -IncludeSites

# Sample Usage: Export only SPWeb analytics
ExportRollupAnalyticsData -RootSiteUrl "http://win-73c72rcrtq5:8056/" -OutputFilePath "C:\temp\analytics-export-webs-only.csv" -IncludeWebs
