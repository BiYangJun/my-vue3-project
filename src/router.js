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
    component: () => import("./pages/BigDataList/BigDataListBase.vue")
  },
  {
    path: "/bigDataPro",
    name: "bigDataPro",
    component: () => import("./pages/BigDataList/BigDataListPro.vue")
  },
  {
    path: "/uploadFile",
    name: "uploadFile",
    component: () => import("./pages/UploadFile/UploadFile.vue")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;