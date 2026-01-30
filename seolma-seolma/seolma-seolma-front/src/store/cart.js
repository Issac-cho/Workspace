import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
    // 장바구니 아이템들
    const items = ref([])

    // 총 아이템 수
    const totalItems = computed(() => {
        return items.value.reduce((total, item) => total + item.quantity, 0)
    })

    // 총 금액
    const totalPrice = computed(() => {
        return items.value.reduce((total, item) => {
            return total + (item.product.price * item.quantity)
        }, 0)
    })

    // 장바구니에 상품 추가
    const addToCart = (cartItem) => {
        const existingItem = items.value.find(
            item => item.product.productId === cartItem.product.productId
        )

        if (existingItem) {
            existingItem.quantity += cartItem.quantity
        } else {
            items.value.push({
                ...cartItem,
                id: Date.now() // 임시 ID
            })
        }
    }

    // 장바구니에서 상품 제거
    const removeFromCart = (productId) => {
        const index = items.value.findIndex(
            item => item.product.productId === productId
        )
        if (index > -1) {
            items.value.splice(index, 1)
        }
    }

    // 수량 업데이트
    const updateQuantity = (productId, quantity) => {
        const item = items.value.find(
            item => item.product.productId === productId
        )
        if (item) {
            if (quantity <= 0) {
                removeFromCart(productId)
            } else {
                item.quantity = quantity
            }
        }
    }

    // 장바구니 비우기
    const clearCart = () => {
        items.value = []
    }

    return {
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    }
})