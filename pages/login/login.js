Page({
    data: {
        signFlag: 'Sign In'
    },
    signClick: function(e) {
      this.setData({
        signFlag: e.target.dataset.flag
      })
    },
    forgetPass: function() {
        console.log("forget");
    }
})