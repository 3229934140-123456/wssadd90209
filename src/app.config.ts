export default defineAppConfig({
  pages: [
    'pages/reception/index',
    'pages/customer/index',
    'pages/injection/index',
    'pages/followup/index',
    'pages/export/index',
    'pages/customer-detail/index',
    'pages/injection-detail/index',
    'pages/medicine-verify/index',
    'pages/signature/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1890FF',
    navigationBarTitleText: '医美注射记录器',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1890FF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/reception/index',
        text: '今日接诊'
      },
      {
        pagePath: 'pages/customer/index',
        text: '客户档案'
      },
      {
        pagePath: 'pages/injection/index',
        text: '点位记录'
      },
      {
        pagePath: 'pages/followup/index',
        text: '术后随访'
      },
      {
        pagePath: 'pages/export/index',
        text: '记录导出'
      }
    ]
  }
})
