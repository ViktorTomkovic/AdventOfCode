param ($year = 2024, $day = 08)
$downloadToPath = "./{0:00}.in.test" -f ($day)
$remoteFileLocation = "https://adventofcode.com/$year/day/$day/input"

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$cookie = New-Object System.Net.Cookie

$cookie.Name = "session"
$cookie.Value = "53616c7465645f5f34bf101b8dc5b798ac063099a867901d40ae6ae039c00f3b10460896238a39d53a08740c5497fdab602ab7290301744c42587bd4ad74d6f6"
$cookie.Domain = ".adventofcode.com"

$session.Cookies.Add($cookie);

Invoke-WebRequest $remoteFileLocation -WebSession $session -TimeoutSec 10 -OutFile $downloadToPath

