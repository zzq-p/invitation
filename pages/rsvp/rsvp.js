const app = getApp();
const config = require('../../config.js');
const storage = require('../../utils/storage.js');

const ROLES = [
  { key: 'teacher', label: '教师', emoji: '👩‍🏫', orgLabel: '所在部门 / 教研室', orgPlaceholder: '如：人工智能学院 机器学习教研室', orgShort: '部　门' },
  { key: 'student', label: '2027届毕业生', emoji: '🧑‍🎓', orgLabel: '所在班级', orgPlaceholder: '如：智能科学与技术 2301 班', orgShort: '班　级' },
  { key: 'alumni', label: '往届校友', emoji: '🧑‍💼', orgLabel: '毕业年份 / 专业', orgPlaceholder: '如：2019 届 / 计算机科学与技术', orgShort: '届　别' },
  { key: 'guest', label: '家长及来宾', emoji: '🧑‍🤝‍🧑', orgLabel: '所在单位（选填）', orgPlaceholder: '请填写所在单位', orgShort: '单　位' }
];

const NEEDS = ['无障碍通道', '校内停车证', '儿童随行', '清真餐 / 素食'];

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    collegeName: config.collegeName,
    grade: config.grade,
    timeText: config.ceremonyTimeText,
    venue: config.venue,

    roles: ROLES,
    needOptions: NEEDS.map((v) => ({ val: v, active: false })),
    orgLabel: ROLES[1].orgLabel,
    orgShortLabel: ROLES[1].orgShort,
    orgPlaceholder: ROLES[1].orgPlaceholder,
    roleLabel: ROLES[1].label,

    form: { role: 'student', name: '', org: '', phone: '', count: 1, needs: [], remark: '' },

    submitted: false,
    ticket: null,
    needsText: '',
    barcodeBars: []
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      navBarHeight: app.globalData.navBarHeight
    });

    // 生成条码条纹
    const bars = [];
    for (let i = 0; i < 30; i++) {
      bars.push({ id: i, w: 2 + Math.floor(Math.random() * 5) });
    }
    this.setData({ barcodeBars: bars });

    // 回填已有确认信息
    const exist = storage.getRsvp();
    if (exist) {
      exist.needs = exist.needs || [];
      this.hydrate(exist);
      this.setData({
        submitted: true,
        ticket: exist,
        needsText: this.needsText(exist.needs)
      });
    }
  },

  /* 从存储恢复表单 */
  hydrate(data) {
    const role = ROLES.find((r) => r.key === data.role) || ROLES[1];
    const needs = data.needs || [];
    this.setData({
      form: {
        role: role.key,
        name: data.name || '',
        org: data.org || '',
        phone: data.phone || '',
        count: data.count || 1,
        needs,
        remark: data.remark || ''
      },
      orgLabel: role.orgLabel,
      orgShortLabel: role.orgShort,
      orgPlaceholder: role.orgPlaceholder,
      roleLabel: role.label,
      needOptions: NEEDS.map((v) => ({ val: v, active: needs.indexOf(v) > -1 }))
    });
  },

  /* 选择身份 */
  pickRole(e) {
    const key = e.currentTarget.dataset.key;
    const role = ROLES.find((r) => r.key === key);
    this.setData({
      'form.role': key,
      orgLabel: role.orgLabel,
      orgShortLabel: role.orgShort,
      orgPlaceholder: role.orgPlaceholder,
      roleLabel: role.label
    });
  },

  /* 通用输入 */
  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },

  plus() {
    if (this.data.form.count >= 6) return;
    this.setData({ 'form.count': this.data.form.count + 1 });
  },

  minus() {
    if (this.data.form.count <= 1) return;
    this.setData({ 'form.count': this.data.form.count - 1 });
  },

  /* 现场需求多选 */
  toggleNeed(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.needOptions[index];
    const active = !item.active;
    const needs = this.data.form.needs.slice();
    const pos = needs.indexOf(item.val);
    if (active && pos === -1) {
      needs.push(item.val);
    } else if (!active && pos > -1) {
      needs.splice(pos, 1);
    }
    this.setData({
      [`needOptions[${index}].active`]: active,
      'form.needs': needs
    });
  },

  /* 提交 */
  submit() {
    const f = this.data.form;
    const name = (f.name || '').trim();
    if (!name) {
      this.toast('请填写您的姓名');
      return;
    }
    const phone = (f.phone || '').trim();
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      this.toast('请填写正确的 11 位手机号');
      return;
    }

    const old = this.data.ticket;
    const ticket = {
      role: f.role,
      name,
      org: (f.org || '').trim(),
      phone,
      count: f.count,
      needs: f.needs,
      remark: (f.remark || '').trim(),
      ticketNo: (old && old.ticketNo) || ('AI2027' + String(Math.floor(100000 + Math.random() * 900000))),
      createdAt: old ? old.createdAt : Date.now()
    };

    storage.saveRsvp(ticket);
    if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
    wx.showToast({ title: '确认成功', icon: 'success', duration: 1400 });
    this.setData({
      submitted: true,
      ticket,
      needsText: this.needsText(ticket.needs)
    });
  },

  /* 修改信息 */
  edit() {
    this.setData({ submitted: false });
  },

  needsText(needs) {
    return needs && needs.length ? needs.join('、') + '；' : '';
  },

  toast(title) {
    wx.showToast({ title, icon: 'none', duration: 1600 });
  },

  goBack() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/home/home' })
    });
  },

  goHome() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/home/home' })
    });
  },

  goWishes() {
    wx.navigateTo({ url: '/pages/wishes/wishes' });
  }
});
