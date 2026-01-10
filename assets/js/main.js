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
 * Fetches the latest 3 blog posts from blog.html and displays them.
 * This function will only run if the '#news-list' element is present.
 */
async function loadLatestBlogs() {
    const newsListDiv = document.getElementById('news-list');
    if (!newsListDiv) {
        return; // Exit if the container isn't on the page
    }

    try {
        const response = await fetch('blog.html');
        if (!response.ok) {
            throw new Error(`Failed to fetch blog.html: ${response.statusText}`);
        }
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        const blogLinks = doc.querySelectorAll('#sidebar .blog-link');
        const posts = [];

        blogLinks.forEach(link => {
            const title = link.querySelector('span.font-medium').textContent;
            const date = link.querySelector('span.text-xs').textContent;
            const url = link.getAttribute('href');
            posts.push({ title, date, url });
        });

        const latestThree = posts.slice(0, 3);

        if (latestThree.length > 0) {
            newsListDiv.innerHTML = latestThree.map(post => `
                <div class="border-b pb-4">
                    <span class="text-sm font-semibold text-gray-500 block">${post.date}</span>
                    <p class="text-lg font-medium text-gray-800 mt-1">
                        <a href="${post.url}" class="lab-color font-bold hover:underline">${post.title}</a>
                    </p>
                </div>
            `).join('');
        } else {
            newsListDiv.innerHTML = `<p class="text-gray-500 italic">No recent blog posts found.</p>`;
        }
    } catch (error) {
        console.error("Error loading latest blogs:", error);
        newsListDiv.innerHTML = `<p class="text-red-600">Error: Could not load blog updates.</p>`;
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
 * Fetches visitor count and location to display in the footer.
 * This will only run if the '#visitor-info' element is present.
 */
async function updateVisitorInfo() {
    const visitorInfoDiv = document.getElementById('visitor-info');
    if (!visitorInfoDiv) {
        return; // Exit if the container isn't on the page
    }

    const counterSpan = document.getElementById('visitor-counter');
    const locationSpan = document.getElementById('visitor-location');

    // Fetch and display visitor count
    try {
        // We use a unique namespace for your site to ensure the count is specific.
        const response = await fetch('https://api.countapi.xyz/hit/mblcbnu-website/index');
        const data = await response.json();
        if (counterSpan) {
            counterSpan.textContent = `Total Visitors: ${data.value}`;
        }
    } catch (error) {
        console.error('Error fetching visitor count:', error);
        if (counterSpan) {
            counterSpan.textContent = 'Visitor count unavailable.';
        }
    }

    // Fetch and display visitor location
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (locationSpan && data.country_name) {
            // Display a more friendly message
            locationSpan.textContent = `Welcome, visitor from ${data.country_name}!`;
        } else if (locationSpan) {
            locationSpan.textContent = 'Location not detected.';
        }
    } catch (error) {
        console.error('Error fetching visitor location:', error);
        if (locationSpan) {
            locationSpan.textContent = 'Location unavailable.';
        }
    }
}


/**
 * Main function to run when the DOM is fully loaded.
 * It initializes all the dynamic parts of the site.
 */
window.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    updateCopyrightYear();

    // Check if we are on the homepage to load the blog posts
    const isIndexPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');
    if (isIndexPage) {
        loadLatestBlogs();
        updateVisitorInfo();
    }
});
