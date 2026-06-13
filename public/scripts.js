let metodoSeleccionado = "";

// cambiar panel activo
function showPanel(id){
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function selectMethod(metodo){
    metodoSeleccionado = metodo;
    showPanel("panelDatos");

    if(metodo === "binance"){
        // Binance
        document.getElementById("datosMetodo").innerHTML = `
            <p onclick="copiar(this, '782849551')">ID BINANCE: 782849551</p>
            <p>NOMBRE: argserver</p>
            <label>Monto en USDT:</label>
            <input type="number" id="montoUSDT" placeholder="Monto en USDT">
        `;
    } else {
        // USDT → ARS
        document.getElementById("datosMetodo").innerHTML = `
            <p>MERCADOPAGO</p>
            <p onclick="copiar(this, '0000003100066665774614')">CVU: 0000003100066665774614</p>
            <p onclick="copiar(this, 'brianna.paredes')">ALIAS: brianna.paredes</p>
            <p>NOMBRE: Rocío Michel Paredes</p>
            <label>Monto en USDT:</label>
            <input type="number" id="montoUSDTTransfer" placeholder="Monto en USDT">
            <p id="equivalenteARS">Equivalente en ARS: $0</p>
        `;

        // listener USDT → ARS
        const inputUSDT = document.getElementById("montoUSDTTransfer");
        inputUSDT.addEventListener("input", function(){
            const valorUSDT = parseFloat(inputUSDT.value) || 0;
            const equivalente = valorUSDT * 1600; // tasa fija
            document.getElementById("equivalenteARS").textContent = 
                `Equivalente en ARS: $${equivalente.toLocaleString("es-AR")}`;
        });
    }
}

// copiar al portapapeles
function copiar(el, texto){
  navigator.clipboard.writeText(texto);
  const s = document.createElement('span');
  s.className = 'copiado';
  s.textContent = '✓ Copiado';
  el.after(s);
  setTimeout(()=>s.remove(), 1500);
}

// ir al formulario
function goToComprobante(){
  showPanel("panelComprobante");
  document.getElementById("montoFinal").placeholder = 
    metodoSeleccionado === "binance" ? "Monto en USDT" : "Monto en ARS";
}

// leer URL
const codigoRecarga = new URLSearchParams(window.location.search).get('recarga') || '';

if(codigoRecarga){
  document.getElementById('recargaCode').textContent = codigoRecarga;
  document.getElementById('recargaBanner').classList.add('show');
} else {
  document.getElementById('recargaMissing').classList.add('show');
}

// enviar comprobante
function enviarATelegram(nombre, correo, monto, file){
  if(!codigoRecarga){
    // si no hay code
    return;
  }

  const TELEGRAM_TOKEN = "8864110213:AAF6KsM3cC5JBmeWZG9zvMaNPXryHG2f0aA"; // < token
  const CHAT_ID = "8757780487";        // < chat id
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`;

  const formData = new FormData();
  formData.append("chat_id", CHAT_ID);
  formData.append("document", file);

  formData.append("caption", 
    `↓ Nuevo comprobante ↓

» CÓDIGO DE RECARGA: ${codigoRecarga}
————————————————————————
» NOMBRE:  ${nombre}

» CORREO:  ${correo}

» MONTO:  ${monto} ${metodoSeleccionado === "binance" ? "USDT" : "ARS"}`
  );

  fetch(url, { method: "POST", body: formData });
}

// panel final según condición
function mostrarPanelFinal(){
  const panelFinal = document.getElementById("panelFinal");

  if(!codigoRecarga){
    // mensaje de error
    panelFinal.innerHTML = `
      <div class="error-icon">❌</div>
      <h1>NO SE PUDO ENVIAR EL COMPROBANTE</h1>
      <p>Falta código de recarga en la URL</p>
    `;
  } else {
    // mensaje de éxito
    panelFinal.innerHTML = `
      <div class="success-icon">✅</div>
      <h1>Comprobante enviado con éxito</h1>
      <p>La acreditación puede demorar hasta 5-10 minutos</p>
      <p id="countdownText">Serás redirigido en... (20 segundos)</p>
    `;

    // cuenta regresiva
    let seconds = 20;
    const countdownEl = document.getElementById("countdownText");
    const interval = setInterval(() => {
      seconds--;
      countdownEl.textContent = `Serás redirigido en... (${seconds} segundos)`;
      if (seconds <= 0) {
        clearInterval(interval);
        window.location.href = "https://argserver.com/";
      }
    }, 1000);
  }

  // panel final
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  panelFinal.classList.add('active');
}

// formulario
document.getElementById("comprobanteForm").addEventListener("submit", function(e){
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const monto = document.getElementById("montoFinal").value;
  const file = document.getElementById("screenshot").files[0];

  enviarATelegram(nombre, correo, monto, file);

  mostrarPanelFinal();
});
