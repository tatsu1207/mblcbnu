/**
 * Fetches and injects the navigation bar into the header.
 * It also highlights the active link based on the current page.
 */
async function loadNavbar() {
    const navContainer = document.getElementById('main-nav');
    if (!navContainer) {
        console.error("Navigation container with ID 'main-nav' not found.");
        return;
    }

    try {
        const response = await fetch('./nav.html');
        if (!response.ok) {
            throw new Error(`Navigation file (nav.html) not found or failed to load: ${response.statusText}`);
        }
        
        const data = await response.text();
        navContainer.innerHTML = data;
        
        // Highlight the active navigation link
        setActiveNavLink(navContainer);

    } catch (error) {
        console.error("Error loading navigation:", error);
        navContainer.innerHTML = `<p class="text-red-500 text-center p-4">Error: Could not load navigation.</p>`;
    }
}

/**
 * Finds the current page and adds the 'active-link' class to the corresponding navigation link.
 * @param {HTMLElement} navContainer - The container element for the navigation.
 */
function setActiveNavLink(navContainer) {
    // Get the current page file name (e.g., "index.html")
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
    const currentPage = pathParts.pop() || 'index.html';

    const links = navContainer.querySelectorAll('.nav-link');
    
    links.forEach(link => {
        // Get the href and find its base file name
        const linkPath = link.getAttribute('href').split('/').pop() || 'index.html';
        if (linkPath === currentPage) {
            link.classList.add('active-link');
            // The following classes are Tailwind classes that might be on the link.
            // Removing them ensures the 'active-link' style takes precedence.
            link.classList.remove('text-gray-600', 'hover:lab-color');
        }
    });
}

/**
 * Fetches news data from a JSON file and populates the news container.
 * This function will only run if the '#news-list' element is present on the page.
 */
async function loadNews() {
    const newsListDiv = document.getElementById('news-list');
    if (!newsListDiv) {
        // If the news container doesn't exist, do nothing.
        return;
    }

    try {
        const response = await fetch('./news_data.json'); 
        if (!response.ok) {
            throw new Error(`Failed to fetch news_data.json: ${response.statusText}`);
        }
        const newsData = await response.json();
        
        if (newsData.length > 0) {
            newsListDiv.innerHTML = newsData.map(item => `
                <div class="border-b pb-4">
                    <span class="text-sm font-semibold ${item.color || 'text-gray-500'} block">${item.date}</span>
                    <p class="text-lg font-medium text-gray-800 mt-1">
                        <span class="lab-color font-bold mr-2">${item.title_tag}</span>
                        ${item.content}
                    </p>
                    ${item.link && item.link_text ? 
                        `<a href="${item.link}" target="_blank" class="text-blue-500 hover:underline text-sm block mt-1">${item.link_text}</a>` 
                        : ''
                    }
                </div>
            `).join('');
        } else {
            newsListDiv.innerHTML = `<p class="text-gray-500 italic">No news items to display.</p>`;
        }
    } catch (error) {
        console.error("Error loading news:", error);
        newsListDiv.innerHTML = `<p class="text-red-600">Error: Could not load news updates.</p>`;
    }
}

/**
 * Finds the element with ID 'copyright-year' and sets its text content to the current year.
 */
function updateCopyrightYear() {
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}


/**
 * Main function to run when the DOM is fully loaded.
 * It initializes all the dynamic parts of the site.
 */
window.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    loadNews(); // This will only run on pages where the news container exists
    updateCopyrightYear();
});
