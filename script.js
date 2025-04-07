document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            const productPrice = this.dataset.productPrice;

            const cartItems = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

            const existingItem = cartItems.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cartItems.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cartItems));
            console.log('Товар додано до кошика:', productName); 
        });
    });
});
