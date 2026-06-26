import { apiFetch } from '../auth/apiFetch';
import { getGuestCart } from '../../components/cart/cartStorage';

export async function getCartRecommendations() {
    const response = await apiFetch(
        `${import.meta.env.VITE_API_BASE_URL}/cart/recommendations`
    );

    if (!response.ok) {
        throw new Error('Could not load recommendations');
    }

    return response.json();
}




export async function getGuestCartRecommendations() {
    const items = getGuestCart();

    const response = await apiFetch(
        `${import.meta.env.VITE_API_BASE_URL}/cart/recommendations/guest`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
        }
    );

    if (!response.ok) {
        throw new Error('Could not load guest recommendations');
    }

    return response.json();
}