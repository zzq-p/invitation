const app = getApp();
const config = require('../../config.js');
const storage = require('../../utils/storage.js');

const ROLE_MAP = {
  teacher: '教师',
  student: '毕业生',
  alumni: '校友',
  guest: '亲友'
};

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    roles: ['教师', '毕业生', '校友', '亲友'],
    form: { name: '', role: '毕业生', text: '' },
    all: []
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      navBarHeight: app.globalData.navBarHeight
    });

    // 若已做出席确认，自动带出称呼与身份
    const rsvp = storage.getRsvp();
    if (rsvp && rsvp.name) {
      this.setData({
        'form.name': rsvp.name,
        'form.role': ROLE_MAP[rsvp.role] || '毕业生'
      });
    }
    this.refresh();
  },

  /* 合并本地寄语与预置寄语 */
  refresh() {
    const mine = storage.getWishes();
    const preset = config.presetWishes.map((w, i) => ({
      key: 'preset_' + i,
      name: w.name,
      role: w.role,
      text: w.text
    }));
    const all = mine.concat(preset);
    this.setData({ all });
  },

  pickRole(e) {
    this.setData({ 'form.role': e.currentTarget.dataset.val });
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },

  submit() {
    const text = (this.data.form.text || '').trim();
    if (text.length < 2) {
      wx.showToast({ title: '请写下至少 2 个字的祝福', icon: 'none' });
      return;
    }
    const name = (this.data.form.name || '').trim() || '匿名同学';
    const wish = {
      key: 'mine_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name,
      role: this.data.form.role,
      text
    };
    storage.addWish(wish);
    if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
    wx.showToast({ title: '已贴上寄语墙', icon: 'success', duration: 1400 });
    this.setData({ 'form.text': '' });
    this.refresh();
  },

  goBack() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/home/home' })
    });
  }
});
