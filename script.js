async function pedirDatosAlBackend(){
    try {
        const response = await fetch("./datos.json")
        const productos = await response.json()
        principal(productos)
    } catch (error) {
        lanzarAlerta("Algo salió mal, error: " + error)
    }
}

pedirDatosAlBackend()

function principal (productos){
    renderizarProductos(productos)
    renderizarCarrito()
        let input = document.getElementById("input")
        input.addEventListener("input", filtrarTarjetas)

        let botonBuscador = document.getElementById("botonBuscador")
        botonBuscador.addEventListener("click", () => filtrarTarjetas(input))

        let botonComprar = document.getElementById("comprar")
        botonComprar.addEventListener("click", finalizarCompra)

        let botonVerOcultar = document.getElementById("verOcultarInfo")
        botonVerOcultar.addEventListener("click", VerOcultarProductosCarrito)
}

function VerOcultarProductosCarrito(e){
    let seccionVentas = document.getElementById("seccionVentas")
    let seccionCarrito = document.getElementById("seccionCarrito")

    seccionVentas.classList.toggle("oculta")
    seccionCarrito.classList.toggle("oculta")
    
    e.target.innerText = e.target.innerText === " Ver carrito" ? " Ver productos" : " Ver carrito" 
} 

function finalizarCompra(){
    lanzarAlerta("¡Gracias por comprar en Verdecora!", "Su compra fue realizada con éxito",  "success", 1500)
localStorage.removeItem("carrito")
renderizarCarrito()
}

function renderizarProductos(productos){
    let contenedor = document.getElementById("productos")
        contenedor.innerHTML = ""
        productos.forEach(( {rutaImagen, nombre, precio, stock, id }) => {
            
                let tarjetaProd = document.createElement("div")
                tarjetaProd.className = "producto"

                tarjetaProd.innerHTML = `
                    <img src="./media/${rutaImagen}" />
                    <h3>${nombre}</h3>
                    <h4>${precio}</h4>
                    <button id=${id}>Agregar al carrito</button>
                    
                `
                contenedor.append(tarjetaProd)
                let btnAgrCar = document.getElementById(id)
                btnAgrCar.addEventListener("click", (e) => AgregarAlCarrito (e, productos))
                
            })
}  

function AgregarAlCarrito(e, productos) {
    let carrito = obtenerCarrito()

    let idBotonProducto = Number(e.target.id)
    let productoBuscado = productos.find(({ id }) => id === idBotonProducto)
    let { id, nombre, precio, stock } = productoBuscado
    let productoEnCarrito = carrito.find(( { id }) => id === idBotonProducto)

    if(stock > 0) {
        productoBuscado.stock--
        if(productoEnCarrito){
            productoEnCarrito.unidades++
            productoEnCarrito.subtotal = productoEnCarrito.precioUnitario * productoEnCarrito.unidades
    } else {
        carrito.push({
            id,
            nombre,
            precioUnitario: precio,
            unidades: 1,
            subtotal: precio,
        })
    }
    localStorage.setItem("carrito", JSON.stringify(carrito))
    renderizarCarrito()
    
    lanzarTostada("Producto agregado", 2000, "bottom", "center")
    } 
}

function modificarTotal(){
    let carrito = obtenerCarrito()
    let nodoTotal = document.getElementById("montoTotal")
    nodoTotal.innerText = carrito ? carrito.reduce((acum,prod) => acum + prod.subtotal, 0) : 0
}

function renderizarCarrito(){
    let carrito = obtenerCarrito()
    let contenedor = document.getElementById("carrito")
    contenedor.innerHTML = ""
    
    carrito.forEach(( { id, nombre, precioUnitario, unidades, subtotal}) => {
        let item = document.createElement("tr") 
        item.id = "prodCarrito" + id
        item.innerHTML = `
        <td>${nombre}</td>
        <td>${precioUnitario}</td>
        <td>
        <button id=menos${id}> - </button>
        <p id=unidades${id}>${unidades}</p>
        <button id=mas${id}> + </button>
        </td>
        <td id=subtotal${id}>${subtotal}</td>
        `
        contenedor.append(item)

        let botonMenos = document.getElementById(`menos${id}`)
        botonMenos.addEventListener("click", restarUnidad)
        let botonMas= document.getElementById(`mas${id}`)
        botonMas.addEventListener("click", sumarUnidad)
    }) 
    modificarTotal()
} 

function restarUnidad(e){
    let id = Number(e.target.id.substring(5))
    let infoProductoEnCarrito = document.getElementById("prodCarrito" + id)
    let carrito = obtenerCarrito()
    let posProductoEnCarrito = carrito.findIndex(producto => producto.id = id)
    
    if (carrito[posProductoEnCarrito].unidades > 1){
        let cantUnidades = document.getElementById("unidades" + id)
        cantUnidades.innerText = Number(cantUnidades.innerText) - 1
        carrito[posProductoEnCarrito].unidades--

        let subtotal = document.getElementById("subtotal" + id)
        subtotal.innerText = carrito[posProductoEnCarrito].precioUnitario * carrito[posProductoEnCarrito].unidades
        carrito[posProductoEnCarrito].subtotal = carrito[posProductoEnCarrito].precioUnitario * carrito[posProductoEnCarrito].unidades

        localStorage.setItem("carrito", JSON.stringify(carrito))
    } else {
        carrito.splice(posProductoEnCarrito, 1)
        localStorage.setItem("carrito", JSON.stringify(carrito))

        infoProductoEnCarrito.remove()
    } 

    modificarTotal()
}

function sumarUnidad(e) {
    let id = Number(e.target.id.substring(3))
    let productos = obtenerDatos()
    let infoProductoEnArrayOriginal = productos.find(producto => producto.id === id)
    let carrito = obtenerCarrito()

    let posProductoEnCarrito = carrito.findIndex(producto => producto.id = id)

    if (carrito[posProductoEnCarrito].unidades < infoProductoEnArrayOriginal.stock) {
        let cantUnidades = document.getElementById("unidades" + id)
        cantUnidades.innerText = Number(cantUnidades.innerText) + 1 
        carrito[posProductoEnCarrito].unidades++
        
        let subtotal = document.getElementById("subtotal" + id)
        subtotal.innerText = carrito[posProductoEnCarrito].precioUnitario * carrito[posProductoEnCarrito].unidades
        carrito[posProductoEnCarrito].subtotal = carrito[posProductoEnCarrito].precioUnitario * carrito[posProductoEnCarrito].unidades

    } 
    localStorage.setItem("carrito", JSON.stringify(carrito))


    modificarTotal()
}

function filtrarTarjetas(){
    let productosFiltrados = productos.filter(producto => producto.nombre.includes(input.value))
    renderizarProductos(productosFiltrados)
}


function obtenerCarrito (){
    return localStorage.getItem("carrito") ? JSON.parse(localStorage.getItem("carrito")) : []
}

function lanzarAlerta(title, text, icon, timer){
    Swal.fire({
        title,
        text,
        icon: icon,
        timer,
        showConfirmButton: false,
    });
}

function lanzarTostada(text, duration, gravity, position){
    Toastify({
        text,
        duration,
        gravity,
        position,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
    }) .showToast();

}

function obtenerDatos() {
    let datos = null
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (datos) {
                resolve(datos)
            } else {
                reject("¡Ups!  algo salió mal")
            }
        }, 1000)
    })
}

obtenerDatos()
    .then((info) => {
        obtenerDatos(info)
    })
    .catch((error) => {
        lanzarAlerta(error)
    })
    