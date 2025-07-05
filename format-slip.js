
// format-slip.js versi aman
const GITHUB_TOKEN = prompt("Masukkan Token GitHub kamu:").trim();
const GITHUB_USER = "Rindu1990";
const GITHUB_REPO = "slip-gaji";
const GITHUB_BRANCH = "main";

function formatTanggal(dateStr) {
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const tgl = new Date(dateStr);
  return `${tgl.getDate()} ${bulan[tgl.getMonth()]} ${tgl.getFullYear()}`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('uploadGitHub').addEventListener('click', async () => {
    const form = document.getElementById('slipForm');
    const data = new FormData(form);

    const nama = data.get('nama');
    const periode = data.get('periode');
    if (!nama || !periode) {
      alert("Nama dan Periode wajib diisi.");
      return;
    }

    const filename = `slip-${nama.replace(/\s+/g, '-').toLowerCase()}-${periode.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [216, 330] });

    const rawURL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filename}`;
    const qr = new QRious({ value: rawURL, size: 120 });
    const imgData = qr.toDataURL();

    let y = 8;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("CV. JUJUHAN MANDIRI", 108, y, null, null, 'center');
    y += 7;
    pdf.setFontSize(11);
    pdf.text("SLIP GAJI KARYAWAN", 108, y, null, null, 'center');
    y += 4;
    pdf.setLineWidth(0.5);
    pdf.line(20, y, 196, y);
    y += 6;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    const info = [
      ['Nama', data.get('nama')],
      ['NIK', data.get('nik')],
      ['Alamat', data.get('alamat')],
      ['Jabatan', data.get('jabatan')],
      ['Status Tanggungan', data.get('status_tanggungan')],
      ['Periode Gaji', data.get('periode')]
    ];
    info.forEach(([label, val], i) => {
      const rowY = y + i * 6;
      pdf.text(label, 20, rowY);
      pdf.text(':', 60, rowY);
      pdf.text(val || '-', 70, rowY);
    });
    y += info.length * 6 + 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("RINCIAN GAJI", 108, y, null, null, 'center');
    y += 4;
    pdf.line(20, y, 196, y);
    y += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Pendapatan", 20, y);
    y += 6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const pendapatan = [
      ['Gaji Pokok', +data.get('gaji_pokok')],
      ['Tunjangan Jabatan', +data.get('tunjangan_jabatan')],
      ['Lembur', +data.get('lembur')],
      ['Uang Makan', +data.get('uang_makan')]
    ];
    const totalPendapatan = pendapatan.reduce((sum, [,v]) => sum + (v || 0), 0);
    pendapatan.forEach(([label, val], i) => {
      const rowY = y + i * 6;
      pdf.text(label, 30, rowY);
      pdf.text(`Rp ${val.toLocaleString('id-ID')}`, 130, rowY);
    });
    y += pendapatan.length * 6;
    pdf.setFont("helvetica", "bold");
    pdf.text("Total Pendapatan", 20, y);
    pdf.text(`Rp ${totalPendapatan.toLocaleString('id-ID')}`, 130, y);
    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Potongan", 20, y);
    y += 6;

    pdf.setFont("helvetica", "normal");
    const potongan = [
      ['Potongan PPh 21', +data.get('pph21')],
      ['Hutang', +data.get('hutang')]
    ];
    const totalPotongan = potongan.reduce((sum, [,v]) => sum + (v || 0), 0);
    potongan.forEach(([label, val], i) => {
      const rowY = y + i * 6;
      pdf.text(label, 30, rowY);
      pdf.text(`Rp ${val.toLocaleString('id-ID')}`, 130, rowY);
    });
    y += potongan.length * 6;
    pdf.setFont("helvetica", "bold");
    pdf.text("Total Potongan", 20, y);
    pdf.text(`Rp ${totalPotongan.toLocaleString('id-ID')}`, 130, y);
    y += 6;

    const bersih = totalPendapatan - totalPotongan;
    pdf.text("Penghasilan Bersih", 20, y);
    pdf.text(`Rp ${bersih.toLocaleString('id-ID')}`, 130, y);

    function terbilang(n) {
      const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
      if (n < 12) return satuan[n];
      if (n < 20) return terbilang(n - 10) + " Belas";
      if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
      if (n < 200) return "Seratus " + terbilang(n - 100);
      if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
      if (n < 2000) return "Seribu " + terbilang(n - 1000);
      if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
      if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
      return "";
    }

    y += 5;
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.text(`(${terbilang(bersih).trim()} Rupiah)`, 20, y);
    y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(`${data.get('tempat') || '-'}, ${formatTanggal(data.get('tanggal'))}`, 140, y);
    y += 5;
    pdf.text("Disahkan oleh", 140, y);
    pdf.addImage(imgData, 'PNG', 140, y + 1, 20, 20);
    y += 22;
    const namaPengesah = data.get('nama_pengesah') || '-';
    pdf.text(namaPengesah, 140, y);
    const textWidth = pdf.getTextWidth(namaPengesah);
    pdf.line(140, y + 1, 140 + textWidth, y + 1);
    y += 5;
    pdf.text(data.get('jabatan_pengesah') || '-', 140, y);
    y += 4;
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "italic");
    pdf.text("Dokumen ini SAH dan tidak memerlukan tanda tangan basah karena dihasilkan otomatis oleh system", 140, y, { maxWidth: 60 });

    const pdfBlob = pdf.output('blob');
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    reader.onloadend = async function () {
      const base64data = reader.result.split(',')[1];
      const uploadURL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filename}`;
      const uploadBody = {
        message: `Upload slip gaji ${nama} periode ${periode}`,
        content: base64data,
        branch: GITHUB_BRANCH
      };
      const res = await fetch(uploadURL, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uploadBody)
      });
      if (res.ok) {
        alert(`✅ Berhasil upload ke GitHub!\n\nFile: ${filename}\n\nBuka di browser: ${rawURL}`);
      } else {
        const result = await res.json();
        alert(`❌ Gagal upload ke GitHub: ${result.message}`);
        console.error(result);
      }
    };
  });
});
