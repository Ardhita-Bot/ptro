import { Client } from 'ssh2'

let handler = async (m, { text, isOwner, conn }) => {
if (!isOwner) return m.reply('Perintah ini khusus owner')
if (!text || !text.includes('|')) return m.reply('Contoh: .installallprotect ip|password')

let [ip, password] = text.split('|')
ip = ip.trim()
password = password.trim()

if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) return m.reply('IP VPS tidak valid')
if (!password) return m.reply('Password VPS tidak valid')

const ssh = new Client()

let statusMsg

ssh.on('ready', async () => {
statusMsg = await m.reply(
`SSH terhubung

Server: ${ip}
Memasang proteksi...`
)

const cmd = 'bash <(curl -s https://raw.githubusercontent.com/Ardhita-Bot/thema/main/installprotect.sh)'

ssh.exec(cmd, (err, stream) => {
if (err) {
ssh.end()
return m.reply('Gagal menjalankan script: ' + err.message)
}

stream.on('data', d => {
let t = d.toString().toLowerCase()
if (t.includes('y/n') || t.includes('continue')) stream.write('y\n')
if (t.includes('enter')) stream.write('\n')
if (t.includes('option') || t.includes('pilih')) stream.write('1\n')
})

stream.on('close', code => {
ssh.end()
if (code === 0) {
m.reply('✅ Instalasi proteksi selesai!')
} else {
m.reply('❌ Instalasi gagal dengan kode: ' + code)
}
})
})
})

ssh.on('error', e => {
m.reply('SSH gagal: ' + e.message)
})

ssh.connect({
host: ip,
port: 22,
username: 'root',
password,
readyTimeout: 30000
})
}

handler.command = ['installallprotect']
handler.tags = ['owner']
handler.help = ['installallprotect ip|password']
handler.owner = true

export default handler