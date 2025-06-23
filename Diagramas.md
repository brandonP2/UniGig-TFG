## Modelo de dominio con diferentes tipos 

    ## diaggrama de clases
    @startuml Sistema de reservas

entity Reserva {
  + pista
  + fecha
  + hora
  + disponibilidad
  + idPago
}

note left of Reserva
 El sistema crea, 
 cancela y muestra 
 el historial de reservas.
 end note

entity Usuario {
  + nombre
  + email
  + telefono
}
entity Pista {
  + número
  + horario
  + capacidad
}

entity Pago {
  + id
  + metodoPago
  + monto
}

entity Bono {
  + horasAbonadas
}

entity Factura {
  + fechaEmision
  + total
  + estado
}

entity Tarifa {
  + precioHora
}


SistemaDeReservas --- Reserva: Gestiona
SistemaDeReservas .. Usuario : > Crea y elimina
Usuario -left- Reserva: > realiza
Reserva --- Pago: requiere
Reserva --- Pista: se lleva a cabo en
Pista --- Tarifa: se fija el precio mediante
Pago --- Factura: Que genera 
Pago --- Bono : < Puede efectuarse por

@enduml

## Diagrama de contexto User 
@startuml

hide empty description

[*] --> INICIO
INICIO --> BookingUneat
note on link
    Iniciar Sesión
end note

BookingUneat --> [*]
note on link
    Cerar Sesión
end note

state BookingUneat {
    [*] --> PantallaPrincipal
    PantallaPrincipal --> GestionarReservas
    note on link
        Realizar Reserva
        Cancelar Reserva
        Ver Historial de Reservas
    end note
    GestionarReservas --> GestionarReservas
    note on link
        Realizar Reserva
        Cancelar Reserva
        Ver Historial de Reservas
    end note
    GestionarReservas --> PantallaPrincipal
        note on link
            Regresar a inicio
        end note

    PantallaPrincipal --> GestionarUsuarios
    note on link
        Borrar Usuario
    end note
    GestionarUsuarios --> GestionarUsuarios
    GestionarUsuarios --> PantallaPrincipal
    note on link
        Regresar a inicio
    end note

    PantallaPrincipal --> GestionarPistas
    note on link
        Leer Hoarios de Pistas
    end note
    GestionarPistas--> GestionarPistas
     note on link
        Leer Hoarios de Pistas
    end note
    GestionarPistas --> PantallaPrincipal
     note on link
        Regresar a inicio
    end note

    PantallaPrincipal --> GestionarPagos
    note on link
        Pagos Reserva
        Comprar Bonos
    end note
    GestionarPagos --> GestionarPagos
    note on link
        Pagos Reserva
        Comprar Bonos
    end note
    GestionarPagos --> PantallaPrincipal
     note on link
        Regresar a inicio
    end note

    
}
@enduml

## diagrama de contexto Admin
@startuml


hide empty description

[*] --> INICIO
INICIO --> BookingUneat
note on link
    Iniciar Sesión
end note

BookingUneat --> [*]
note on link
    Cerar Sesión
end note

state BookingUneat {
    [*] --> PantallaPrincipal
    note on link
        Diferente pagina para
        cada tipo de usuario
    end note

    PantallaPrincipal --> GestionarBonos
    note on link
        Leer Bonos
    end note
    
    GestionarBonos --> GestionarBonos
    note on link
        Crear Bonos
        Actualizar Bonos
        Borrar Bonos
        Leer Bonos
    end note
    GestionarBonos --> PantallaPrincipal
    note on link
        Regresar a inicio
    end note

    PantallaPrincipal --> GestionarReservas
    note on link
        Ver Historial de Reservas
    end note

    GestionarReservas --> PantallaPrincipal
    note on link
        Regresar a inicio
    end note

    PantallaPrincipal --> GestionarUsuarios
    note on link
        Borrar Usuarios
    end note
    GestionarUsuarios --> GestionarUsuarios
    note on link
        Borrar Usuarios
    end note
    GestionarUsuarios --> PantallaPrincipal
    note on link
        Regresar a inicio
    end note

    PantallaPrincipal --> GestionarPistas
    note on link
        Leer Hoarios de Pistas
    end note
    GestionarPistas--> GestionarPistas
    note on link
        Borrar Pistas
        Crear Pistas
        Actualizar Pistas
        Leer Pistas
        Actualizar Horarios de Pistas
    end note
    GestionarPistas --> PantallaPrincipal
    note on link
        Regresar a inicio
    end note

    PantallaPrincipal --> GestionarPagos
    note on link
        Ver Historial de Pagos
    end note
    GestionarPagos --> PantallaPrincipal
    note on link
        Regresar a inicio
    end note

    PantallaPrincipal --> GestionarNotificaciones
    note on link
        Leer Notificaciones
    end note
    GestionarNotificaciones --> GestionarNotificaciones
    note on link
        Crear Notificaciones
        Actualizar Notificaciones
        Borrar Notificaciones
        Leer Notificaciones
    end note
    GestionarNotificaciones --> PantallaPrincipal
    note on link
        Regresar a inicio
    end note
}
@enduml

## Diagrama de estados
# Diagrama de estados de pago 
@startuml
hide empty description
[*] --> ElegirMetodoPago
ElegirMetodoPago --> PagoConTarjeta
ElegirMetodoPago --> PagoConBonos
PagoConTarjeta --> ProcesarPago : Procesar pago con tarjeta
PagoConBonos --> ProcesarPago : Procesar pago con bonos
ProcesarPago --> ConfirmarReserva : Pago exitoso
ProcesarPago --> CancelarPago : Pago fallido
ConfirmarReserva --> ReservaExitosa : Reserva confirmada
CancelarPago --> PagoFallido : Pago cancelado o fallido
PagoFallido --> ElegirMetodoPago : Reintentar pago
@enduml

# Diagrama de estados pista
@startuml
hide empty description
[*] --> Ocupada
Ocupada --> NoOcupada
NoOcupada--> Ocupada 
@enduml

# Diagrama de estados sistema 
@startuml
hide empty description
[*] --> Encendido
Encendido--> Apagado
Apagado--> Encendido
@enduml

# Diagrama de estados usuario
@startuml
hide empty description
[*] --> NoLogueado
NoLogueado --> CrearCuenta : No tiene cuenta
CrearCuenta --> IngresaDatos
IngresaDatos --> ValidaDatos
ValidaDatos --> CuentaCreada : Datos Válidos
ValidaDatos --> CrearCuenta : Datos Inválidos
CuentaCreada --> NoLogueado
NoLogueado --> IngresarCredenciales : Tiene Cuenta
note right of IngresarCredenciales
 correo (@alumnos.uneatlantico.es)
 y contraseña
end note
IngresarCredenciales --> ValidarCredenciales 
ValidarCredenciales --> NoLogueado : Credenciales incorrectas
ValidarCredenciales --> Logueado : Credenciales correctas
Logueado --> Sistema : Acceder al sistema
Sistema --> [*]
@enduml

## Diagrama de objetos 
@startuml

object SistemaDeReservas
object Reserva {
   pista : 1
   fecha: 17/05/2024
   hora: 10:00
   disponibilidad: sí
   idPago: 198341
}
object Usuario {
   nombre: JonDoe
   email: Jon.Doe@alumnos.unetalantico.es
   telefono: +34 123456789
}
object Pista {
   número: 1 
   horario: 8:00-20:00
   capacidad: 4
}
object Pago {
   metodoDePago: Tarjeta de Crédito
   monto: 8€
}
object Bono {
   horasAbonadas: 3
}
object Factura {
   fechaEmision: 17/05/2024 
   total: 8€
   estado: Pendiente
}
object Tarifa {
   precioHora: 8€
}


SistemaDeReservas .. Usuario :> Crea y elimina
SistemaDeReservas --- Reserva : Gestiona
Usuario --left- Reserva:> realiza
Reserva --- Pago: requiere
Reserva --- Pista: se lleva a cabo en
Pista --- Tarifa: se fija el precio mediante

Pago --- Factura: Que genera 
Pago --- Bono : < Puede efectuarse por

@enduml


## Esto es todo lo que encapsula el modelo de dominio


## Casos de uso
# Bonos
@startuml

left to right direction

actor Admin as A


package Bonos{

    usecase "Crear Bonos" as UC1
    usecase "Leer Bonos" as UC2
    usecase "Actualizar  Bonos" as UC3
    usecase "Borrar Bonos" as UC4
    
}

A --> UC1
A --> UC2
A --> UC3
A --> UC4

@enduml
    
    
# Notificaciones
@startuml

left to right direction

actor Time as T
actor Admin as A

package Notificaciones{

   usecase "Enviar Notificaciones" as UC1

   usecase "Crear Notificaciones" as UC2
   usecase "Leer Notificaciones" as UC3
   usecase "Actualizar Notificaciones" as UC4
   usecase "Borrar Notificaciones" as UC5
}

T --> UC1


A --> UC2
A --> UC5
A --> UC3
A --> UC4

@enduml

# Pagos
@startuml

left to right direction

actor User as U
actor Admin as A

package Pagos{

    usecase "Pagar Reserva" as UC1
    usecase "Pagar con Bonos" as UC2
    usecase "Ver Historial de Pagos" as UC3
    usecase "Comprar Bonos" as UC4

}

U --> UC1
UC1 -> UC2
U --> UC3
U --> UC4

A --> UC3

@enduml

# Pistas
@startuml

left to right direction

actor User as U
actor Admin as A

package Pistas {

     usecase "Leer  Horarios de Pistas" as UC2
     usecase "Actualizar Horarios de Pistas" as UC3

     usecase "Crear Pistas" as UC5
     usecase "Leer Pistas" as UC6
     usecase "Actualizar Pistas" as UC7
     usecase "Borrar Pistas" as UC8
}

U -->UC2

A -->UC2
A -->UC3
A -->UC5
A -->UC6
A -->UC7
A -->UC8




@enduml

# Reserva
@startuml

left to right direction

actor User as U
actor Admin as A


package Reserva{

    usecase "Realizar Reserva" as UC1
    usecase "Cancelar Reserva" as UC2
    usecase "Ver Historial de Reservas" as UC3
}

U --> UC1
U -->UC2
U -->UC3

A-->UC3






@enduml

# Usuario

@startuml

left to right direction


actor User as U
actor Admin as A

package Usuarios{

    usecase "Crear Usuario" as UC1
    usecase "Login" as UC2
    usecase "Borrar Usuario" as UC3

}

U --> UC1
U --> UC2

A --> UC3
U --> UC3

@enduml

## Esto es lo que encapsula los casos de uso 


## Casos de uso detallados
# Actualizar bonos
@startuml
title Actualizar Bonos (Admin)

[*] --> Inicio
note right on link
 El **administrador** accede desde la página de inicio
end note

Inicio --> ListaDeBonos 
note right on link
 El **administrador** accede a la opción 
 de ver la lista de Bonos
end note

ListaDeBonos --> EditarBonos
note right on link
 El **administrador** selecciona un bono
 de la lista para editar
end note

EditarBonos --> BonosActualizados
note right on link
 El **administrador** confirma los cambios
 realizados en el bono
end note

BonosActualizados --> ListaDeBonos
note right on link
 El **administrador** elige actualizar
 otro bono
end note

BonosActualizados --> [*]
note right on link
 El **administrador** finaliza el proceso
 de actualización de bonos
end note

@enduml

# borrar bonos
@startuml
title Borrar Bonos (Admin)

[*] --> Inicio
note right on link
El **administrador** empieza desde la 
página de inicio de la aplicación
end note

Inicio --> ListaDeBonos

ListaDeBonos --> ConfirmarBorrado 
note right on link
El **administrador** accede a la lista de bonos
y selecciona un bono para borrar
end note

ConfirmarBorrado --> BonoBorrado
note right on link
El **administrador** confirma la eliminación
del bono seleccionado
end note

BonoBorrado --> ListaDeBonos
note right on link
El **administrador** elige borrar otro bono
end note

BonoBorrado --> [*] 
note right on link
El **administrador** finaliza el proceso de
borrado de bonos
end note

@enduml

# crear bonos
@startuml
title Crear Bonos (Admin)

[*] --> Inicio
note right on link
El **administrador** empieza desde la 
página de inicio de la aplicación
end note

Inicio --> FormularioDeCreacion
note right on link
El **administrador** navega al formulario
para iniciar la creación de un nuevo bono
end note

FormularioDeCreacion --> ValidacionDatos
note right on link
El **administrador** accede al formulario
para crear un nuevo bono
end note

ValidacionDatos --> BonoCreado
note right on link
El **administrador**completa todos
los parámetros necesarios en el formulario 
para crear el bono
end note

BonoCreado --> [*]
note right on link
El **administrador** finaliza el proceso de
creación de bonos
end note

@enduml

# Leer bonos

@startuml
title Leer Bonos (Admin)

[*] --> Inicio
note right on link
El **administrador** empieza desde la 
página de inicio de la aplicación
end note

Inicio --> ListaDeBonos
note right on link
El **administrador** carga la lista de bonos
disponibles desde la página de inicio
end note

ListaDeBonos --> VerDetalle
note right on link
El **administrador** selecciona un bono de la lista
para ver los detalles
end note

VerDetalle --> [*]
note right on link
El **administrador** visualiza el bono en detalle
y finaliza el proceso
end note

@enduml

# ActualizarNotificacions

@startuml

[*] --> VerNotificaciones
note on link
 El **administrador** accede a la opción 
 de ver sus notificaciones

 El **sistema** muestra las notificaciones
end note

VerNotificaciones --> SeleccionarNotificacion
note on link
 El **administrador** selecciona la notificación 
 que desea actualizar
end note

SeleccionarNotificacion --> ActualizarEstado
note on link
 El **sistema** actualiza el estado 
 de la notificación seleccionada
end note

ActualizarEstado --> ConfirmarActualizacion
note on link
 El **sistema** actualiza el estado 
 de la notificación
end note

ActualizarEstado --> [*]
note on link
**Error de Actualización:**
el **sistema** le muestra un error al 
**administrador** si no se puede actualizar 
la notificación y se le recomienda intentarlo 
más tarde
end note

ConfirmarActualizacion ---> MostrarConfirmacion
note on link
El **sistema** muestra al 
**administrador** una confirmación 
de la actualización de la notificación
end note

MostrarConfirmacion --> [*]
@enduml

# CrearNotificaciones
@startuml

[*] --> CrearNotificacion
note on link
 El **administrador** accede a la opción 
 de crear una nueva notificación

 El **sistema** muestra un formulario para crear
una nueva notificación
end note

CrearNotificacion --> SeleccionarDestinatario
note on link
 El **administrador** selecciona el destinatario 
 de la notificación
end note

SeleccionarDestinatario --> IngresarContenido
note on link
 El **administrador** ingresa el contenido 
 de la notificación
end note

IngresarContenido --> ConfirmarContenido 
note on link
 El **administrador** confirma el contenido 
 de la notificación
end note

ConfirmarContenido --> [*]
note on link
 El **sistema** muestra al administrador 
 una confirmación del contenido 
 de la notificación
end note

@enduml

# EnviarNotificaciones
@startuml

[*] ---> VerNotificacionesPendientes
note on link
 El **sistema** muestra las notificaciones 
 pendientes de envío al **administrador**
end note

VerNotificacionesPendientes --> SeleccionarNotificacion
note on link
 El **administrador** selecciona la notificación 
 que desea enviar
end note

SeleccionarNotificacion --> SeleccionarDestinatario
note on link
 El **administrador** selecciona el destinatario 
 al cual enviar la notificación
end note

SeleccionarDestinatario --> EnviarNotificacion
note on link
 El **sistema** envía la notificación al 
 destinatario seleccionado
end note

EnviarNotificacion --> ConfirmarEnvio 
note on link
 El **sistema** después de 
 enviar la notificación, se 
 confirma al **admistrador** 
 que se ha enviado con éxito
end note

EnviarNotificacion --> [*]
note on link
**Error de Envío:**
El **sistema** le muestra un error 
al administrador si no se puede 
enviar la notificacióny se le 
recomienda intentarlo más tarde
end note

ConfirmarEnvio --> ActualizarEstado
note  on  link
El **sistema** actualiza el estado de la 
notificación enviada
end note

ActualizarEstado --> MostrarConfirmacion
note on link
El **sistema** muestra al 
usuario una confirmación 
del envío de la notificación
end note

MostrarConfirmacion --> VerNotificacionesPendientes
@enduml

# LeerNotificaciones
@startuml

[*] --> VerNotificaciones
note on link
 El **usuario** accede a la opción 
 de ver sus notificaciones

 El **sistema** muestra las notificaciones
end note

VerNotificaciones --> SeleccionarNotificacion
note on link
 El **usuario** selecciona la notificación 
 que desea leer
end note

SeleccionarNotificacion --> LeerNotificacion
note on link
 El **sistema** muestra el contenido 
 de la notificación seleccionada
end note

LeerNotificacion --> ConfirmarLectura 
note on link
 El **usuario** confirma que ha leído 
 la notificación
end note

ConfirmarLectura --> MostrarConfirmacion
note on link
 El **sistema** muestra una confirmación 
 al **usuario** de que la notificación 
 ha sido marcada como leída
end note

MostrarConfirmacion --> [*]

@enduml

# ComprarBonos
@startuml

[*] --> ComprarBonos
note on link
 El **usuario** accede a la opción 
 de comprar bonos en el **sistema**
end note

ComprarBonos --> SeleccionarCantidad
note on link
 El **usuario** elige la cantidad 
 de bonos que desea comprar
end note

SeleccionarCantidad --> RealizarPago
note on link
 El **sistema** procesa el pago 
 de los bonos seleccionados
end note

RealizarPago --> ConfirmarCompra
note on link
    El **sistema** confirma la compra 
    de los bonos al **usuario**
end note

ConfirmarCompra --> MostrarConfirmacion
note  on  link
    El **sistema** muestra un mensaje 
    de confirmación y se añaade los
    bonos a la cuenta del **usuario**
end note

RealizarPago -[#red]-> NotificarFalloPago
note on link
    El **sistema** notifica al 
    **usuario** que el pago no 
    se ha podido realizar
    debido a un error
end note

NotificarFalloPago -[#red]> [*]

MostrarConfirmacion ---> [*]

@enduml

# PagarConBonos
@startuml

[*] --> MetodoDePago
note on link
 El usuario escoge que 
 método de pago usar
 
 **Método de Pago: Bono**
end note

MetodoDePago --> RealizarPago
note on link
El **sistema** verifica que el **usuario**
tenga Bonos para realizar el pago y 
el **sistema** los descuenta de su cuenta
end note

RealizarPago --> ConfirmarReserva  
note on link
    El **sistema** muestra 
    un mensaje de confirmación 
    al **usuario**
end note

RealizarPago -[#red]-> NotificarPagoFallido  
note on link
 El **sistema** muestra un 
 mensaje de error al usuario, 
end note

RealizarPago -[#red]-> NotificarFondosInsuficientes 
note on link
    El **sistema** muestra un 
    mensaje de error al **usuario**, 
    indicando que no tiene
    suficientes fondos
end note

NotificarPagoFallido -[#red]-> [*]

NotificarFondosInsuficientes -[#red]-> [*]

ConfirmarReserva --> [*]
note on link
    El **sistema** añade la reserva
    a la cuenta del **usuario**

end note

@enduml

# PagarReserva
@startuml

[*] --> MetodoDePago
MetodoDePago --> PagarConBonos
note left of PagarConBonos
Este es el CDU de 
**PagarConBonos**
end note

MetodoDePago --> PagarConTarjeta
note on link
 El usuario escoge que 
 método de pago usar
 
 **Método de Pago: Tarjeta**
end note

PagarConTarjeta --> RealizarPago
note on link
**Datos De Pago:**
  - Número de Tarjeta
  - Nombre del Titular
  - Fecha de Caducidad
  - Código de Seguridad

 El **sistema** efectua el pago
 con el TPV virtual
end note

RealizarPago ---> ConfirmarReserva 
note on link
  El **sistema** muestra un mensaje 
  de confirmación al **usuario**
end note

RealizarPago --[#red]-> NotificarPagoFallido 
note on link
 El **sistema** muestra un 
 mensaje de error al **usuario**
end note

NotificarPagoFallido --[#red]-> [*]

ConfirmarReserva ---> [*]
note on link
 El **sistema** añade la reserva
 a la cuenta del **usuario**
end note

@enduml

# VerHistorialDePagos
@startuml

[*] --> VerHistorialReservas
note on link
 El **usuario** accede al historial 
 de reservas
end note

VerHistorialReservas --> ConsultarReservas
note on link
 El **sistema** consulta la base de datos 
 para obtener el historial de reservas
end note

ConsultarReservas --> MostrarHistorial
note on link
Se agrega un filtro a la consulta
que varía según el tipo de **usuario**:

**Historial de Usuario**
El sistema presenta al usuario 
su historial de reservas.

**Historial de Administrador**
El sistema exhibe al administrador
el historial de reservas.
end note

MostrarHistorial --> [*]
@enduml

# Borrar usuario
@startuml
title Borrar Usuario

[*] --> BorrarUsuario
note right on link
 El **usuario/administrador** accede a la opción 
 de eliminar un usuario del sistema

 Dependiendo de su rol: 
 - **Usuario**: solo se puede borrar a el mismo 
 - **Administrador**: puede eliminar cualquier usuario
end note

BorrarUsuario --> VerificarUsuario
note right on link
 El **sistema** verifica la identidad 
 del usuario/administrador
end note

VerificarUsuario --> ConfirmarBorrado

ConfirmarBorrado --> BorrarCuenta
note right on link
 El **sistema** procede a eliminar la cuenta 
 del usuario seleccionado
end note

BorrarCuenta --> [*] 

@enduml

# Crear usuario
@startuml
[*] --> Inicio
note right on link
El proceso comienza con el usuario
accediendo a la web desde la página de inicio.
end note

Inicio --> Formulario
note right on link
El usuario navega a la página del formulario de registro.
end note

Formulario : DNI\nEmail\nNombre\nNumero de telefono\nCodigo postal

Formulario --> DatosValidados 
note right on link
El usuario envía el formulario con sus datos para verificación.
end note


DatosValidados --> CuentaCreada 
note right on link
Si los datos son válidos, se crea la cuenta del usuario.
end note

DatosValidados --> Formulario 
note right on link
Si los datos no son válidos, el formulario es mostrado
nuevamente para corrección.
end note


CuentaCreada --> [*]
note right on link
El proceso de creación de la cuenta finaliza.
end note
@enduml

# Login

@startuml
[*] --> NoAutenticado : Inicio

state NoAutenticado {
  [*] --> EsperandoCredenciales : Usuario accede al sistema
  EsperandoCredenciales --> VerificandoCredenciales : Credenciales ingresadas
  VerificandoCredenciales --> Autenticado : Credenciales válidas
  VerificandoCredenciales --> NoAutenticado : Credenciales inválidas
  Autenticado --> [*] : Cerrar sesión
}

state Autenticado {
  [*] --> PaginaPrincipal : Mostrar página principal
  PaginaPrincipal --> [*] : Cerrar sesión
}

@enduml