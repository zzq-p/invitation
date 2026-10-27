const app = getApp();
const config = require('../../config.js');

Page({
  data: {
    statusBarHeight: 20,
    schoolName: config.schoolName,
    collegeName: config.collegeName,
    grade: config.grade,
    ceremonyName: config.ceremonyName,
    musicEnabled: !!config.bgmSrc,
    musicPlaying: false
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight
    });
  },

  onReady() {
    this.initParticles();
  },

  onUnload() {
    this.destroyed = true;
    if (this.raf) {
      const canvas = this.canvas;
      if (canvas && canvas.cancelAnimationFrame) canvas.cancelAnimationFrame(this.raf);
    }
  },

  /* 开启邀请函 */
  openInvite() {
    wx.navigateTo({
      url: '/pages/home/home'
    });
  },

  /* 背景音乐开关 */
  toggleMusic() {
    const playing = app.toggleMusic();
    this.setData({ musicPlaying: playing });
  },

  /* ============================================================
     粒子背景：星点闪烁 + 神经网络节点连线 + 上浮金点
     ============================================================ */
  initParticles() {
    const query = wx.createSelectorQuery();
    query.select('#particle')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio) || 2;
        const W = res[0].width;
        const H = res[0].height;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        this.canvas = canvas;
        this.ctx = ctx;
        this.W = W;
        this.H = H;

        const rand = (a, b) => a + Math.random() * (b - a);

        // 闪烁星点
        const stars = [];
        const starCount = Math.round((W * H) / 26000);
        for (let i = 0; i < starCount; i++) {
          stars.push({
            x: rand(0, W),
            y: rand(0, H),
            r: rand(0.6, 1.8),
            baseA: rand(0.25, 0.9),
            tw: rand(0.6, 2.2),     // 闪烁周期
            phase: rand(0, Math.PI * 2)
          });
        }

        // 神经网络节点
        const nodes = [];
        const nodeCount = Math.max(26, Math.round(W / 12));
        for (let i = 0; i < nodeCount; i++) {
          nodes.push({
            x: rand(0, W),
            y: rand(0, H),
            vx: rand(-0.16, 0.16),
            vy: rand(-0.16, 0.16),
            r: rand(1.2, 2.4)
          });
        }

        // 上浮金点
        const sparks = [];
        for (let i = 0; i < 16; i++) {
          sparks.push({
            x: rand(0, W),
            y: rand(0, H),
            r: rand(1.2, 3.2),
            vy: rand(-0.35, -0.12),
            vx: rand(-0.08, 0.08),
            a: rand(0.2, 0.75)
          });
        }

        const draw = (time) => {
          if (this.destroyed) return;
          const t = (time || 0) / 1000;
          ctx.clearRect(0, 0, W, H);

          // 星点
          for (const s of stars) {
            const alpha = s.baseA * (0.55 + 0.45 * Math.sin(t / s.tw * Math.PI * 2 + s.phase));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 228, 255, ${alpha})`;
            ctx.fill();
          }

          // 神经网络节点 + 连线
          for (const n of nodes) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > W) n.vx *= -1;
            if (n.y < 0 || n.y > H) n.vy *= -1;
          }
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[i].x - nodes[j].x;
              const dy = nodes[i].y - nodes[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 105) {
                const alpha = (1 - dist / 105) * 0.18;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = `rgba(126, 146, 232, ${alpha})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
              }
            }
          }
          for (const n of nodes) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(180, 196, 255, 0.75)';
            ctx.fill();
          }

          // 上浮金点
          for (const p of sparks) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -8) {
              p.y = H + 8;
              p.x = rand(0, W);
            }
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
            grad.addColorStop(0, `rgba(232, 200, 122, ${p.a})`);
            grad.addColorStop(1, 'rgba(232, 200, 122, 0)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          }

          this.raf = canvas.requestAnimationFrame(draw);
        };

        this.raf = canvas.requestAnimationFrame(draw);
      });
  }
});
