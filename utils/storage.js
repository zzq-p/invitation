/**
 * 本地存储工具：出席确认（RSVP）与祝福墙
 * 数据仅保存在本机微信小程序缓存中，不经过任何服务器。
 */

const RSVP_KEY = 'invitation_rsvp_2027';
const WISH_KEY = 'invitation_wishes_2027';

/* ---------------- 出席确认 ---------------- */

function getRsvp() {
  try {
    return wx.getStorageSync(RSVP_KEY) || null;
  } catch (e) {
    return null;
  }
}

function saveRsvp(data) {
  try {
    wx.setStorageSync(RSVP_KEY, data);
    return true;
  } catch (e) {
    return false;
  }
}

function removeRsvp() {
  try {
    wx.removeStorageSync(RSVP_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

/* ---------------- 祝福墙 ---------------- */

function getWishes() {
  try {
    const list = wx.getStorageSync(WISH_KEY);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function addWish(wish) {
  try {
    const list = getWishes();
    list.unshift(wish);
    wx.setStorageSync(WISH_KEY, list);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  getRsvp,
  saveRsvp,
  removeRsvp,
  getWishes,
  addWish
};
