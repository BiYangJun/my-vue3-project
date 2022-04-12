import { createWebHistory, createRouter } from "vue-router";

const routes =  [
  {
    path: "/",
    name: "main",
    component: () => import("./pages/main.vue")
  },
  {
    path: "/bigDataBase",
    name: "bigDataBase",
    component: () => import("./pages/BigDataListBase.vue")
  },
  {
    path: "/bigDataPro",
    name: "bigDataPro",
    component: () => import("./pages/BigDataListPro.vue")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;