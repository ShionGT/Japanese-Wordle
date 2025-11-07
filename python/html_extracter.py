import requests

def download_html(url, filename):
    """
    Downloads the HTML content from a given URL and saves it to a file.

    Args:
        url (str): The URL of the HTML page to download.
        filename (str): The name of the file to save the HTML content to.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(response.text)
        print(f"HTML content from {url} successfully downloaded to {filename}")

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

# Example usage:
url_to_download = "https://tango.nante-yomu.com/4moji/"
output_filename = "output/output.html"
download_html(url_to_download, output_filename)
