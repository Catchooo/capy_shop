document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartItemCountElement = document.getElementById('cart-item-count');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    const aiModal = document.getElementById('ai-modal');
    const openAiBtn = document.getElementById('open-ai-btn');
    const closeAiBtn = document.getElementById('close-ai-btn');
    const aiChatLog = document.getElementById('ai-chat-log');
    const aiInput = document.getElementById('ai-input');
    const sendAiBtn = document.getElementById('send-ai-btn');
    const loadingIndicator = document.getElementById('loading-indicator');

    openAiBtn.addEventListener('click', () => {
        aiModal.classList.add('open');
    });

    closeAiBtn.addEventListener('click', () => {
        aiModal.classList.remove('open');
    });

    window.addEventListener('click', (event) => {
        if (event.target === aiModal) {
            aiModal.classList.remove('open');
        }
    });

    sendAiBtn.addEventListener('click', () => {
        const message = aiInput.value.trim();
        if (message) {
            addUserMessage(message);
            aiInput.value = '';
            sendToGemini(message);
        }
    });

    aiInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendAiBtn.click();
        }
    });

    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('ai-message', 'user');
        messageDiv.textContent = text;
        aiChatLog.appendChild(messageDiv);
        aiChatLog.scrollTop = aiChatLog.scrollHeight;
    }

    function addAiMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('ai-message', 'ai');
        messageDiv.textContent = text;
        aiChatLog.appendChild(messageDiv);
        aiChatLog.scrollTop = aiChatLog.scrollHeight;
    }

    function addAiErrorMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('ai-message', 'ai-error');
        messageDiv.textContent = text;
        aiChatLog.appendChild(messageDiv);
        aiChatLog.scrollTop = aiChatLog.scrollHeight;
    }

    async function sendToGemini(message) {
        const proxyUrl = 'gemini_proxy.php';

        try {
            loadingIndicator.style.display = 'block';
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ gemini_message: message }),
            });
            loadingIndicator.style.display = 'none';

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Помилка від бекенду:', errorData);
                addAiErrorMessage('Виникла помилка при отриманні відповіді від ШІ: ' + errorData);
                return;
            }

            const data = await response.json();
            const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiResponse) {
                addAiMessage(aiResponse);
            } else {
                addAiErrorMessage('Не вдалося отримати змістовну відповідь від ШІ.');
            }

        } catch (error) {
            console.error('Помилка відправки запиту на бекенд:', error);
            addAiErrorMessage('Не вдалося зв\'язатися з сервером ШІ.');
            loadingIndicator.style.display = 'none';
        } finally {
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }

    function updateCartDisplay() {
        const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
        } else {
            emptyCartMessage.style.display = 'none';
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <img src="capybara${item.id}.png" alt="${item.name}">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price} грн</div>
                    </div>
                    <div class="cart-item-quantity">Кількість: ${item.quantity}</div>
                    <button class="remove-from-cart-btn" data-product-id="${item.id}">Видалити</button>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
                total += parseFloat(item.price) * item.quantity;
            });

            const removeButtons = document.querySelectorAll('.remove-from-cart-btn');
            removeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const productIdToRemove = this.dataset.productId;
                    removeProductFromCart(productIdToRemove);
                });
            });
        }

        cartTotalElement.textContent = total.toFixed(2) + ' грн';
        cartItemCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function removeProductFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart'));
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }

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
                cartItems.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cartItems));
            updateCartDisplay();
            console.log('Товар додано до кошика:', productName);
        });
    });

    openCartBtn.addEventListener('click', () => {
        updateCartDisplay();
        cartModal.style.display = 'flex';
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    updateCartDisplay();
});
