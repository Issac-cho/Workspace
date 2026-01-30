import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/Register.vue')
    },
    {
        path: '/coupons',
        name: 'Coupons',
        component: () => import('@/views/CouponPage.vue')
    },
    {
        path: '/my-coupons',
        name: 'MyCoupons',
        component: () => import('@/views/MyCouponPage.vue')
    },
    {
        path: '/order',
        name: 'Order',
        component: () => import('@/views/OrderPage.vue')
    },
    {
        path: '/my-orders',
        name: 'MyOrders',
        component: () => import('@/views/MyOrderPage.vue')
    },
    // 관리자 페이지
    {
        path: '/admin/products/register',
        name: 'AdminProductRegister',
        component: () => import('@/views/admin/ProductRegisterPage.vue')
    },
    {
        path: '/admin/products',
        name: 'AdminProductList',
        component: () => import('@/views/admin/ProductListPage.vue')
    },
    {
        path: '/admin/orders',
        name: 'AdminOrderList',
        component: () => import('@/views/admin/AdminOrderListPage.vue')
    },
    {
        path: '/admin/coupons/register',
        name: 'AdminCouponRegister',
        component: () => import('@/views/admin/CouponRegisterPage.vue')
    },
    {
        path: '/admin/coupons',
        name: 'AdminCouponTemplateList',
        component: () => import('@/views/admin/CouponTemplateListPage.vue')
    },
    // 공통 에러 페이지
    {
        path: '/error',
        name: 'Error',
        component: () => import('@/views/ErrorPage.vue')
    },
    // 404는 맨 마지막에 위치
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        redirect: () => {
            return {
                name: 'Error',
                query: {
                    code: '404',
                    message: '요청하신 페이지를 찾을 수 없습니다.'
                },
                replace: true // 히스토리 대체
            }
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 라우터 가드
router.beforeEach((to, from, next) => {
    // 에러 페이지가 아닌 경우에만 이전 페이지로 기록
    if (from.path !== '/error' && from.path !== to.path) {
        sessionStorage.setItem('previousPage', from.path)
    }

    next()
})

export default router