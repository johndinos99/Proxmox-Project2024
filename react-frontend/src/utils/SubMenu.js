// Function for toggling the navbar submenu.
export const toggleMenu = () => {
    let subMenu = document.getElementById('subMenu');
    let isOpen = subMenu.classList.contains('open-menu');

    subMenu.classList.toggle('open-menu', !isOpen);

    const closeMenuOnOutsideClick = (event) => {
        const button = document.querySelector('.user-pic');

        if (!subMenu.contains(event.target) && event.target !== button) {
            subMenu.classList.remove('open-menu');
            document.body.removeEventListener('click', closeMenuOnOutsideClick);
        }
    };

    if (!isOpen) {
        document.body.addEventListener('click', closeMenuOnOutsideClick);
    }
};