## Modelo de dominio con diferentes tipos 

## Diagrama de clases
@startuml Sistema UniGig

entity User
entity Student
entity Client
entity Service
entity Category
entity Gig
entity Review
entity Message
entity Conversation
entity ActivityLogs

note left of User
  The system manages two types
  of users: students and
  clients.
end note

note right of Service
  Students offer services
  in different categories.
end note

note right of Gig
  Clients publish jobs
  they need to get done.
end note

note "Students can\napply to gigs" as N1
Student .. N1
N1 .. Gig

User -- Student : has >
User -- Client : has >
Student -- Service : offers >
Client -- Service : requests >
Student -- Gig : applies to >
Client -- Gig : publishes >
Service -- Category : belongs to >
Gig -- Category : belongs to >
User .. Conversation : belongs to >
Conversation -- Message : send >
Message -- User : Receives >
User --  ActivityLogs : generates >
Gig --  ActivityLogs : records >
ActivityLogs  --  Review : has >

@enduml





##Caso de uso gestion de gigs y servicios

@startuml
package "Gigs and Service Management"{
left to right direction

' Actors
actor "Student" as student
actor "Client" as client
actor "Administrator" as admin

package "Service Management" {
    usecase createService as "createService()"
    usecase listServices as "listServices()"
    usecase editService as "editService()"
    usecase deleteService as "deleteService()"
}

package "Gig Management" {
    usecase createGig as "createGig()"
    usecase listGigs as "listGigs()"
    usecase editGig as "editGig()"
    usecase deleteGig as "deleteGig()"
}

' Student connections
student --> (createService)
student --> (listServices)
student --> (editService)
student --> (listGigs)
student --> (deleteService)


' Client connections
client --> (createGig)
client --> (listGigs)
client --> (editGig)
client --> (listServices)
client --> (deleteGig)

' Admin connections
admin --> (deleteService)
admin --> (deleteGig)
}
@enduml






## Caso de uso gestion de estudiantes

@startuml Student_Management
left to right direction

Package "Student Mangement" {
' Actors
actor "Student" as student
actor "Administrator" as admin

package "Profile Management" {
    usecase editProfile as "editProfile"
    usecase viewProfile as "viewProfile"
    usecase deleteProfile as "deleteProfile"
}

package "Skills Management" {
    usecase addSkill as "addSkill"
    usecase listSkills as "listSkills"
    usecase updateSkill as "updateSkill"
    usecase removeSkill as "deleteSkill"
}

package "Service History" {
    usecase viewHistory as "viewHistory"
    usecase listCompletedServices as "listCompletedServices"
    usecase viewServiceDetails as "viewServiceDetails"
}

' Student connections
student --> (editProfile)
student --> (viewProfile)
student --> (addSkill)
student --> (listSkills)
student --> (updateSkill)
student --> (viewHistory)
student --> (listCompletedServices)
student --> (viewServiceDetails)
student --> (deleteProfile)
student --> (removeSkill)


' Admin connections
admin --> (deleteProfile)
admin --> (viewProfile)
admin --> (listCompletedServices)
}
@enduml




## Caso de uso Gestión de Clientes
@startuml

package "Client Management"{
left to right direction

' Actors
actor "Client" as client
actor "Administrator" as admin

package "Profile Management" {
    usecase editProfile as "editProfile()"
    usecase viewProfile as "viewProfile()"
    usecase deleteProfile as "deleteProfile()"
}

package "Payment Management" {
    usecase addPaymentMethod as "addPaymentMethod()"
    usecase listPaymentMethods as "listPaymentMethods()"
    usecase updatePaymentMethod as "updatePaymentMethod()"
    usecase removePaymentMethod as "removePaymentMethod()"
}

package "Gig History" {
    usecase viewHistory as "viewHistory()"
    usecase listCompletedGigs as "listCompletedGigs()"
    usecase viewGigDetails as "viewGigDetails()"
}

' Client connections
client --> (editProfile)
client --> (viewProfile)
client --> (addPaymentMethod)
client --> (listPaymentMethods)
client --> (updatePaymentMethod)
client --> (removePaymentMethod)
client --> (viewHistory)
client --> (listCompletedGigs)
client --> (viewGigDetails)
client --> (deleteProfile)

' Admin connections
admin --> (deleteProfile)
admin --> (viewProfile)
admin --> (listCompletedGigs)
}
@enduml









## Diagrama de contexto este es el diagrama correcto
## System Context Diagram

## Diagrama de contexto estudiante
@startuml Student_Context_Diagram

left to right direction
skinparam linetype polyline

state "NO_AUTENTICADO" as NoAuth
state "AUTENTICANDO" as PreMenu
state "MENU_PRINCIPAL" as Menu

state "LISTANDO_SERVICIOS" as ListServices
state "EDITANDO_SERVICIO" as EditService
state "LISTANDO_GIGS" as ListGigs
state "VISUALIZANDO_GIG" as ViewGig
state "EDITANDO_PERFIL" as EditProfile
state "GESTIONANDO_HABILIDADES" as ManageSkills
state "LISTANDO_MENSAJES" as ListMessages
state "VISUALIZANDO_MENSAJE" as ViewMessage
state "LISTANDO_REVIEWS" as ListReviews
state "CREANDO_REVIEW" as CreateReview

[*] --> NoAuth

PreMenu --> NoAuth
    note on link
        iniciarSesion(error)
    end note

NoAuth --> PreMenu
    note on link
        iniciarSesion()
    end note

PreMenu --> Menu
    note on link
        mostrarMenu()
    end note

Menu --> NoAuth
    note on link
        cerrarSesion()
    end note

Menu --> ListServices
    note on link
        listarServicios()
    end note

Menu --> ListGigs
    note on link
        listarGigs()
    end note

Menu --> EditProfile
    note on link
        editarPerfil()
    end note

Menu --> ListMessages
    note on link
        listarMensajes()
    end note

Menu --> ListReviews
    note on link
        listarReviews()
    end note

ListServices --> EditService
    note on link
        crearServicio()
    end note

ListServices --> EditService
    note on link
        editarServicio()
    end note

ListServices --> ListServices
    note on link
        eliminarServicio()
    end note

EditService --> EditService
    note on link
        guardarServicio()
    end note

EditService --> ListServices
    note on link
        listarServicios()
    end note

ListGigs --> ViewGig
    note on link
        verDetallesGig()
    end note

ViewGig --> ListGigs
    note on link
        volverALista()
    end note

EditProfile --> ManageSkills
    note on link
        gestionarHabilidades()
    end note

ManageSkills --> EditProfile
    note on link
        guardarHabilidades()
    end note

EditProfile --> EditProfile
    note on link
        guardarPerfil()
    end note

ListMessages --> ViewMessage
    note on link
        verMensaje()
    end note

ViewMessage --> ListMessages
    note on link
        volverAMensajes()
    end note

ListMessages --> ListMessages
    note on link
        eliminarMensaje()
    end note

ListReviews --> CreateReview
    note on link
        crearReview()
    end note

CreateReview --> ListReviews
    note on link
        guardarReview()
    end note

ListServices --> Menu
    note on link
        mostrarMenu()
    end note

ListGigs --> Menu
    note on link
        mostrarMenu()
    end note

EditProfile --> Menu
    note on link
        mostrarMenu()
    end note

ListMessages --> Menu
    note on link
        mostrarMenu()
    end note

ListReviews --> Menu
    note on link
        mostrarMenu()
    end note

@enduml

##Cliente
@startuml Client_Context_Diagram

left to right direction
skinparam linetype polyline

state "NO_AUTENTICADO" as NoAuth
state "AUTENTICANDO" as PreMenu
state "MENU_PRINCIPAL" as Menu

state "LISTANDO_GIGS" as ListGigs
state "EDITANDO_GIG" as EditGig
state "LISTANDO_SERVICIOS" as ListServices
state "VISUALIZANDO_SERVICIO" as ViewService
state "EDITANDO_PERFIL" as EditProfile
state "GESTIONANDO_PAGOS" as ManagePayments
state "LISTANDO_MENSAJES" as ListMessages
state "VISUALIZANDO_MENSAJE" as ViewMessage
state "LISTANDO_REVIEWS" as ListReviews
state "CREANDO_REVIEW" as CreateReview

[*] --> NoAuth

PreMenu --> NoAuth
    note on link
        iniciarSesion(error)
    end note

NoAuth --> PreMenu
    note on link
        iniciarSesion()
    end note

PreMenu --> Menu
    note on link
        mostrarMenu()
    end note

Menu --> NoAuth
    note on link
        cerrarSesion()
    end note

Menu --> ListGigs
    note on link
        listarGigs()
    end note

Menu --> ListServices
    note on link
        listarServicios()
    end note

Menu --> EditProfile
    note on link
        editarPerfil()
    end note

Menu --> ListMessages
    note on link
        listarMensajes()
    end note

Menu --> ListReviews
    note on link
        listarReviews()
    end note

ListGigs --> EditGig
    note on link
        crearGig()
    end note

ListGigs --> EditGig
    note on link
        editarGig()
    end note

ListGigs --> ListGigs
    note on link
        eliminarGig()
    end note

EditGig --> EditGig
    note on link
        guardarGig()
    end note

EditGig --> ListGigs
    note on link
        listarGigs()
    end note

ListServices --> ViewService
    note on link
        verDetallesServicio()
    end note

ViewService --> ListServices
    note on link
        volverALista()
    end note

EditProfile --> ManagePayments
    note on link
        gestionarMetodosPago()
    end note

ManagePayments --> EditProfile
    note on link
        guardarMetodosPago()
    end note

EditProfile --> EditProfile
    note on link
        guardarPerfil()
    end note

ListMessages --> ViewMessage
    note on link
        verMensaje()
    end note

ViewMessage --> ListMessages
    note on link
        volverAMensajes()
    end note

ListMessages --> ListMessages
    note on link
        eliminarMensaje()
    end note

ListReviews --> CreateReview
    note on link
        crearReview()
    end note

CreateReview --> ListReviews
    note on link
        guardarReview()
    end note

ListGigs --> Menu
    note on link
        mostrarMenu()
    end note

ListServices --> Menu
    note on link
        mostrarMenu()
    end note

EditProfile --> Menu
    note on link
        mostrarMenu()
    end note

ListMessages --> Menu
    note on link
        mostrarMenu()
    end note

ListReviews --> Menu
    note on link
        mostrarMenu()
    end note

@enduml

##Admin
@startuml Admin_Context_Diagram

left to right direction
skinparam linetype polyline

state "NO_AUTENTICADO" as NoAuth
state "AUTENTICANDO" as PreMenu
state "MENU_PRINCIPAL" as Menu

state "LISTANDO_USUARIOS" as ListUsers
state "VISUALIZANDO_USUARIO" as ViewUser
state "LISTANDO_SERVICIOS" as ListServices
state "MODERANDO_SERVICIO" as ModerateService
state "LISTANDO_GIGS" as ListGigs
state "MODERANDO_GIG" as ModerateGig
state "LISTANDO_REVIEWS" as ListReviews
state "MODERANDO_REVIEW" as ModerateReview
state "LISTANDO_REPORTES" as ListReports
state "GESTIONANDO_REPORTE" as ManageReport

[*] --> NoAuth

PreMenu --> NoAuth
    note on link
        iniciarSesion(error)
    end note

NoAuth --> PreMenu
    note on link
        iniciarSesion()
    end note

PreMenu --> Menu
    note on link
        mostrarMenu()
    end note

Menu --> NoAuth
    note on link
        cerrarSesion()
    end note

Menu --> ListUsers
    note on link
        listarUsuarios()
    end note

Menu --> ListServices
    note on link
        listarServicios()
    end note

Menu --> ListGigs
    note on link
        listarGigs()
    end note

Menu --> ListReviews
    note on link
        listarReviews()
    end note

Menu --> ListReports
    note on link
        listarReportes()
    end note

ListUsers --> ViewUser
    note on link
        verDetallesUsuario()
    end note

ViewUser --> ListUsers
    note on link
        volverALista()
    end note

ListUsers --> ListUsers
    note on link
        suspenderUsuario()
    end note

ListServices --> ModerateService
    note on link
        moderarServicio()
    end note

ModerateService --> ListServices
    note on link
        aplicarModeracion()
    end note

ListGigs --> ModerateGig
    note on link
        moderarGig()
    end note

ModerateGig --> ListGigs
    note on link
        aplicarModeracion()
    end note

ListReviews --> ModerateReview
    note on link
        moderarReview()
    end note

ModerateReview --> ListReviews
    note on link
        aplicarModeracion()
    end note

ListReports --> ManageReport
    note on link
        gestionarReporte()
    end note

ManageReport --> ListReports
    note on link
        resolverReporte()
    end note

ListUsers --> Menu
    note on link
        mostrarMenu()
    end note

ListServices --> Menu
    note on link
        mostrarMenu()
    end note

ListGigs --> Menu
    note on link
        mostrarMenu()
    end note

ListReviews --> Menu
    note on link
        mostrarMenu()
    end note

ListReports --> Menu
    note on link
        mostrarMenu()
    end note

@enduml
























## Detalle de casos de uso 
## inciar sesion
@startuml IniciarSesion_UniGig

hide empty description

' Estilos generales para coincidir con el ejemplo (actualizados)
skinparam state {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A 
}
skinparam arrow {
  Thickness 2
}
skinparam note {
  BackgroundColor #D0D3D4 
  BorderColor #4CAF50
  FontColor #17202A 
}

' Actor Usuario (común, representa a Estudiante, Cliente, Administrador)
state Usuario

' Estado compuesto para el caso de uso "Iniciar Sesión"
state IniciarSesion {
  state " " as Estado1
  state " " as Estado2
  state " " as Estado3

  ' Flujo principal (verde)
  [*] --> Estado1
  note on link
    El usuario (Estudiante/Cliente/Administrador)
    introduce la opción "Iniciar Sesión".
  end note

  Estado1 -[#green]-> Estado2
  note on link
    El sistema muestra un formulario para
    - Correo Electrónico
    - Contraseña.
  end note

  Estado2 -[#green]-> Estado3
  note on link
    El usuario introduce
    - Correo Electrónico
    - Contraseña.
  end note

  Estado3 --> [*]
  note on link
    El sistema valida las credenciales y, si son correctas,
    otorga acceso y redirige al dashboard principal.
  end note

  ' Camino alternativo (rojo): Credenciales incorrectas
  Estado3 -[#red]-> Estado1
  note on link
    El sistema muestra un mensaje de error:
    "Credenciales incorrectas. Inténtalo de nuevo."
    y vuelve a la pantalla de acceso.
  end note
}

' Estados para la bifurcación post-inicio de sesión según el rol
state rombo <<choice>>
state Estudiante
state Cliente
state Administrador

' Conexión del actor al caso de uso
Usuario --> IniciarSesion

' Conexión del caso de uso a la bifurcación por rol
IniciarSesion --> rombo

' Bifurcaciones por rol
rombo --> Estudiante
rombo --> Cliente
rombo --> Administrador

@enduml

## GestionarPerfil

@startuml GestionarPerfil_UniGig

hide empty description

' Estilos generales
skinparam state {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A
}
skinparam arrow {
  Thickness 2
}
skinparam note {
  BackgroundColor #D0D3D4
  BorderColor #4CAF50
  FontColor #17202A
}

' Actor Usuario
state Usuario

' Estado compuesto para el caso de uso "Gestionar Perfil"
state GestionarPerfil {
  state " " as Estado1
  state " " as Estado2
  state " " as Estado3

  ' Flujo principal (verde)
  [*] --> Estado1
  note on link
    El usuario (Estudiante/Cliente/Administrador)
    selecciona la opción "Gestionar Perfil" en el sistema.
  end note

  Estado1 -[#green]-> Estado2
  note on link
    El sistema muestra el formulario de perfil
    con los datos actuales del usuario precargados.
  end note

  Estado2 -[#green]-> Estado3
  note on link
    El usuario introduce o modifica los datos
    de su perfil.
  end note

  Estado3 --> [*]
  note on link
    El sistema valida los datos introducidos,
    guarda los cambios en la base de datos del perfil,
    y confirma la actualización exitosa al usuario.
  end note

  ' Camino alternativo (rojo): Datos inválidos o error al guardar
  Estado3 -[#red]-> Estado2
  note on link
    El sistema muestra un mensaje de error
  end note

  ' Camino alternativo (rojo): Usuario aborta la operación
  Estado2 -[#red]-> [*]
  note on link
    El usuario decide cancelar la operación de gestión de perfil
    y vuelve al estado o pantalla anterior.
  end note
}

' Conexión del actor al caso de uso
Usuario --> GestionarPerfil

GestionarPerfil --> [*]
@enduml

## Gestionar comunicacion

@startuml GestionarComunicacion_UniGig

hide empty description

' Estilos generales
skinparam state {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A
}
skinparam arrow {
  Thickness 2
}
skinparam note {
  BackgroundColor #D0D3D4
  BorderColor #4CAF50
  FontColor #17202A
}

' Actor Usuario
state Usuario

' Estado compuesto para el caso de uso "Gestionar Comunicación"
state GestionarComunicacion {
  state " " as Estado1
  state " " as Estado2
  state " " as Estado3

  ' Flujo principal (verde)
  [*] --> Estado1
  note on link
    El usuario (Estudiante/Cliente/Administrador)
    selecciona la opción "Gestionar Comunicación" o "Mensajes" en el sistema.
  end note

  Estado1 -[#green]-> Estado2
  note on link
    El sistema muestra la interfaz de mensajería,
    con la bandeja de entrada y las conversaciones existentes.
  end note

  Estado2 -[#green]-> Estado3
  note on link
    El usuario selecciona una conversación y hace una operación.
  end note

  Estado3 --> [*]
  note on link
    El sistema procesa la acción (envía el mensaje, guarda borrador, etc.)
    o aplica los cambios de gestión, y confirma la operación al usuario.
  end note

  ' Camino alternativo (rojo): Error en el procesamiento de la comunicación
  Estado3 -[#red]-> Estado2
  note on link
    El sistema muestra un mensaje de error.
  end note

  ' Camino alternativo (rojo): Usuario aborta la operación
  Estado2 -[#red]-> [*]
  note on link
    El usuario decide cancelar la operación de comunicación
    y vuelve a la vista anterior o al Dashboard.
  end note
}

' Conexión del actor al caso de uso
Usuario --> GestionarComunicacion

GestionarComunicacion --> [*]
@enduml

##Publicar Gig/Servicio
@startuml PublicarServicioGig_UniGig

hide empty description

' Estilos generales
skinparam state {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A
}
skinparam arrow {
  Thickness 2
}
skinparam note {
  BackgroundColor #D0D3D4
  BorderColor #4CAF50
  FontColor #17202A
}

' Actor Estudiante / Cliente
state "Estudiante/Cliente" as Actor

' Estado compuesto para el caso de uso "Publicar Servicio/Gig"
state PublicarServicioGig {
  state " " as Estado1
  state " " as Estado2
  state " " as Estado3

  ' Flujo principal (verde)
  [*] --> Estado1
  note on link
    El Estudiante selecciona "Publicar Servicio"
    o el Cliente selecciona "Publicar Gig".
  end note

  Estado1 -[#green]-> Estado2
  note on link
    El sistema muestra un formulario con campos
    para los detalles del servicio/gig (título, descripción, categoría, precio).
  end note

  Estado2 -[#green]-> Estado3
  note on link
    El usuario introduce los detalles requeridos
    en el formulario de publicación.
  end note

  Estado3 --> [*]
  note on link
    El sistema valida los datos,
    guarda el nuevo servicio/gig,
    y lo publica en la plataforma,
    confirmando la operación al usuario.
  end note

  ' Camino alternativo (rojo): Datos inválidos o incompletos
  Estado3 -[#red]-> Estado2
  note on link
    El sistema muestra un mensaje de error.
  end note

  ' Camino alternativo (rojo): Usuario aborta
  Estado2 -[#red]-> [*]
  note on link
    El usuario decide cancelar la publicación
    y vuelve a la pantalla anterior.
  end note
}

' Conexión del actor al caso de uso
Actor --> PublicarServicioGig

PublicarServicioGig --> OPEN_DASHBOARD
@enduml

## Encontrar servicios/gigs
@startuml EncontrarServiciosGigs_UniGig

hide empty description

' Estilos generales
skinparam state {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A
}
skinparam arrow {
  Thickness 2
}
skinparam note {
  BackgroundColor #D0D3D4
  BorderColor #4CAF50
  FontColor #17202A
}

' Actor Estudiante / Cliente
state "Estudiante/Cliente" as Actor

' Estado compuesto para el caso de uso "Encontrar Servicios/Gigs"
state EncontrarServiciosGigs {
  state " " as Estado1
  state " " as Estado2
  state " " as Estado3

  ' Flujo principal (verde)
  [*] --> Estado1
  note on link
    El Estudiante selecciona "Buscar Gigs"
    o el Cliente selecciona "Buscar Servicios".
  end note

  Estado1 -[#green]-> Estado2
  note on link
    El sistema muestra la interfaz de búsqueda.
  end note

  Estado2 -[#green]-> Estado3
  note on link
    El usuario introduce los criterios de búsqueda
    y aplica los filtros deseados.
  end note

  Estado3 --> [*]
  note on link
    El sistema procesa la búsqueda,
    muestra una lista de servicios/gigs coincidentes,
    y permite al usuario interactuar con los resultados.
  end note

  ' Camino alternativo (rojo): Sin resultados
  Estado3 -[#red]-> Estado2
  note on link
    El sistema muestra un mensaje de error.
  end note

  ' Camino alternativo (rojo): Usuario aborta
  Estado2 -[#red]-> [*]
  note on link
    El usuario decide cancelar la búsqueda
    y vuelve a la pantalla anterior.
  end note
}

' Conexión del actor al caso de uso
Actor --> EncontrarServiciosGigs
EncontrarServiciosGigs --> OPEN_DASHBOARD
@enduml

## Gestion de proyectos
@startuml GestionarEjecucionProyecto_UniGig

hide empty description

' Estilos generales
skinparam state {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A
}
skinparam arrow {
  Thickness 2
}
skinparam note {
  BackgroundColor #D0D3D4
  BorderColor #4CAF50
  FontColor #17202A
}

' Actor Estudiante / Cliente
state "Estudiante/Cliente" as Actor

' Estado compuesto para el caso de uso "Gestionar Ejecución de Proyecto"
state GestionarEjecucionProyecto {
  state " " as Estado1
  state " " as Estado2
  state " " as Estado3

  ' Flujo principal (verde)
  [*] --> Estado1
  note on link
    El usuario (Estudiante/Cliente)
    accede a la sección de "Mis Proyectos" o "Gigs Asignados/Contratados".
  end note

  Estado1 -[#green]-> Estado2
  note on link
    El sistema muestra el listado de proyectos activos
    y el detalle del proyecto seleccionado.
  end note

  Estado2 -[#green]-> Estado3
  note on link
    El Estudiante puede:
    - Actualizar progreso
    - Subir entregables
    - Solicitar aclaraciones.
    El Cliente puede:
    - Revisar progreso/entregables
    - Solicitar revisiones
    - Aprobar entregas.
  end note

  Estado3 --> [*]
  note on link
    El sistema procesa la acción.
  end note

  ' Camino alternativo (rojo): Error en la acción o validación
  Estado3 -[#red]-> Estado2
  note on link
    El sistema muestra un mensaje de error.
  end note

  ' Camino alternativo (rojo): Usuario aborta
  Estado2 -[#red]-> [*]
  note on link
    El usuario decide salir de la gestión del proyecto
    sin realizar cambios pendientes.
  end note
}

' Conexión del actor al caso de uso
Actor --> GestionarEjecucionProyecto
GestionarEjecucionProyecto --> OPEN_DASHBOARD
@enduml

## Completar transaccion
@startuml CompletarValorarTransaccion_UniGig

hide empty description

' Estilos generales
skinparam state {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A
}
skinparam arrow {
  Thickness 2
}
skinparam note {
  BackgroundColor #D0D3D4
  BorderColor #4CAF50
  FontColor #17202A
}

' Actor Cliente / Estudiante / Pasarela de Pago
state "Cliente/Estudiante" as Actor
state "Pasarela de Pago" as PaymentGateway

' Estado compuesto para el caso de uso "Completar y Valorar Transacción"
state CompletarValorarTransaccion {
  state " " as Estado1
  state " " as Estado2
  state " " as Estado3
  state " " as Estado4

  ' Flujo principal (verde)
  [*] --> Estado1
  note on link
    El Cliente aprueba la entrega final del servicio/gig.
    O el Estudiante indica que el trabajo está listo para pago.
  end note

  Estado1 -[#green]-> Estado2
  note on link
    El sistema inicia el proceso de pago,
    redirigiendo al Cliente a la Pasarela de Pago
    o mostrando opciones de pago.
  end note

  Estado2 -[#green]-> Estado3
  note on link
    El Cliente completa el pago a través de la Pasarela de Pago.
    La Pasarela de Pago notifica al sistema el éxito/fallo.
  end note

  Estado3 -[#green]-> Estado4
  note on link
    El sistema registra el pago,
    libera los fondos al Estudiante (si aplica),
    y solicita al Cliente/Estudiante dejar una reseña.
  end note

  Estado4 --> [*]
  note on link
    El usuario (Cliente/Estudiante) deja una reseña
    o decide omitirla, finalizando la transacción.
  end note

  ' Camino alternativo (rojo): Pago fallido
  Estado3 -[#red]-> Estado2
  note on link
    La Pasarela de Pago informa un fallo.
    El sistema muestra un error y permite reintentar el pago.
  end note

  ' Camino alternativo (rojo): Error al guardar reseña
  Estado4 -[#red]-> Estado4
  note on link
    El sistema muestra un error al guardar la reseña
    y permite al usuario corregir y reintentar.
  end note

  ' Camino alternativo (rojo): Usuario aborta
  Estado2 -[#red]-> [*]
  note on link
    El Cliente cancela el proceso de pago.
  end note
}

' Conexiones de actores
Actor --> CompletarValorarTransaccion
PaymentGateway --> CompletarValorarTransaccion
CompletarValorarTransaccion --> OPEN_DASHBOARD
@enduml

## Supervisar y moderar plataforma

@startuml SupervisarModerarPlataforma_UniGig

hide empty description

' Estilos generales
skinparam state {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A
}
skinparam arrow {
  Thickness 2
}
skinparam note {
  BackgroundColor #D0D3D4
  BorderColor #4CAF50
  FontColor #17202A
}

' Actor Administrador
state Administrador

' Estado compuesto para el caso de uso "Supervisar y Moderar Plataforma"
state SupervisarModerarPlataforma {
  state " " as Estado1
  state " " as Estado2
  state " " as Estado3

  ' Flujo principal (verde)
  [*] --> Estado1
  note on link
    El Administrador accede al panel de administración.
  end note

  Estado1 -[#green]-> Estado2
  note on link
    El sistema muestra la interfaz correspondiente.
  end note

  Estado2 -[#green]-> Estado3
  note on link
    El Administrador revisa la información.
  end note

  Estado3 --> [*]
  note on link
    El sistema procesa la acción administrativa,
    aplica los cambios en la plataforma,
    y confirma la operación al Administrador.
  end note

  ' Camino alternativo (rojo): Error en la acción administrativa
  Estado3 -[#red]-> Estado2
  note on link
    El sistema muestra un mensaje de error.
  end note

  ' Camino alternativo (rojo): Administrador aborta
  Estado2 -[#red]-> [*]
  note on link
    El Administrador decide cancelar la operación
    y vuelve al panel principal.
  end note
}

' Conexión del actor al caso de uso
Administrador --> SupervisarModerarPlataforma
SupervisarModerarPlataforma --> OPEN_DASHBOARD
@enduml

## Resolver conflicto

@startuml ResolverConflictos_UniGig

hide empty description

' Estilos generales
skinparam state {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A
}
skinparam arrow {
  Thickness 2
}
skinparam note {
  BackgroundColor #D0D3D4
  BorderColor #4CAF50
  FontColor #17202A
}

' Actores
state Administrador
state Estudiante
state Cliente

' Estado compuesto para el caso de uso "Resolver Conflictos"
state ResolverConflictos {
  state " " as Estado1
  state " " as Estado2
  state " " as Estado3
  state " " as Estado4

  ' Flujo principal (verde)
  [*] --> Estado1
  note on link
    Un Estudiante o Cliente reporta una disputa
    relacionada con un servicio/gig.
    O el Administrador identifica un conflicto.
  end note

  Estado1 -[#green]-> Estado2
  note on link
    El sistema notifica al Administrador
    y muestra los detalles del conflicto (partes, gig, historial de mensajes).
  end note

  Estado2 -[#green]-> Estado3
  note on link
    El Administrador revisa la evidencia,
    solicita información adicional a las partes (Estudiante/Cliente),
    e inicia la mediación.
  end note

  Estado3 -[#green]-> Estado4
  note on link
    El Administrador toma una decisión sobre la disputa
    (ej. reembolso parcial/total, finalización del gig, penalización).
  end note

  Estado4 --> [*]
  note on link
    El sistema aplica la resolución (ej. procesa reembolso),
    notifica a las partes involucradas,
    y cierra el caso de conflicto.
  end note

  ' Camino alternativo (rojo): Error al procesar la resolución
  Estado4 -[#red]-> Estado3
  note on link
    El sistema muestra un mensaje de error al aplicar la resolución
    y permite al Administrador reintentar o modificarla.
  end note

  ' Camino alternativo (rojo): Partes no cooperan / Conflicto no resuelto
  Estado3 -[#red]-> Estado4
  note on link
    Las partes no llegan a un acuerdo o no proveen información.
    El Administrador puede forzar una decisión o escalar.
  end note

  ' Camino alternativo (rojo): Administrador aborta la gestión
  Estado2 -[#red]-> [*]
  note on link
    El Administrador decide no proceder con la resolución
    o posponerla.
  end note
}

' Conexiones de actores al caso de uso
Estudiante --> ResolverConflictos : "Reporta disputa"
Cliente --> ResolverConflictos : "Reporta disputa"
Administrador --> ResolverConflictos : "Gestiona conflicto"
ResolverConflictos --> OPEN_DASHBOARD
@enduml

## MVC
## Modelos
@startuml UniGig_Models_Diagram

hide empty description

skinparam package {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A
  ArrowColor #AA0000
  BorderThickness 2
}
skinparam component {
  BackgroundColor #E8F8F5
  BorderColor #2ECC71
  FontColor #17202A
}
skinparam arrow {
  Thickness 2
  Color #AA0000
  LineStyle dashed
}
skinparam note {
  BackgroundColor #D0D3D4
  BorderColor #4CAF50
  FontColor #17202A
}

title UniGig - Diagrama de Paquetes (Modelos)

package "Models" {

  package "Entities (Datos Centrales)" as DomainEntities {
    component "User (Usuario)"
    component "Profile (Perfil)"
    component "Service (Servicio)"
    component "Gig (Tarea/Proyecto)"
    component "Project (Ejecución de Proyecto)"
    component "Message (Mensaje)"
    component "Notification (Notificación)"
    component "Transaction (Transacción)"
    component "Payment (Pago)"
    component "Review (Reseña)"
    component "Dispute (Disputa)"
    component "Report (Reporte Moderación)"
    note bottom
      Representación de las estructuras de datos
      y objetos de negocio principales de la aplicación.
    end note
  }

  package "Business Logic & Services (Lógica de Negocio)" as BusinessLogic {
    component "AuthService (Autenticación)"
    component "UserProfileService (Gestión de Perfiles)"
    component "ServiceGigManager (Gestión Servicios/Gigs)"
    component "ProjectManager (Gestión Proyectos)"
    component "PaymentService (Gestión Pagos)"
    component "MessagingService (Gestión Mensajes)"
    component "NotificationService (Gestión Notificaciones)"
    component "AdminService (Gestión Administrativa)"
    component "DisputeResolutionService (Gestión Disputas)"
    component "SearchService (Búsqueda)"
    note bottom
      Contiene la lógica de negocio, las reglas y los servicios
      que operan sobre las Entidades del Dominio.
    end note
  }

  package "Data Access (Acceso a Datos)" as DataAccess {
    component "UserRepository"
    component "ServiceRepository"
    component "ProjectRepository"
    component "MessageRepository"
    component "TransactionRepository"
    component "ReviewRepository"
    ' ... otros repositorios
    note bottom
      Responsable de la persistencia y recuperación de datos
      desde y hacia la base de datos.
    end note
  }

  package "External Integrations (Integraciones Externas)" as ExternalIntegrations {
    component "PaymentGatewayClient"
    component "EmailServiceClient"
    component "SMSServiceClient"
    note bottom
      Clientes para la comunicación con sistemas o servicios
      de terceros (ej. pasarelas de pago, envío de correos).
    end note
  }

  ' Dependencias dentro del paquete Models
  BusinessLogic .left.> DomainEntities : "Opera sobre"
  BusinessLogic .down.> DataAccess : "Utiliza para persistencia"
  BusinessLogic .down.> ExternalIntegrations : "Utiliza para servicios externos"
  DataAccess .up.> DomainEntities : "Mapea/Persiste"

  note "El paquete 'Models' encapsula\ntodos los datos de la aplicación,\nla lógica de negocio y las \nresponsabilidades de persistencia." as ModelsNote
  ModelsNote .. Models

}

@enduml

## Vista

@startuml UniGig_Views_Diagram

hide empty description

skinparam package {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A
  ArrowColor #AA0000
  BorderThickness 2
}
skinparam component {
  BackgroundColor #E8F8F5
  BorderColor #2ECC71
  FontColor #17202A
}
skinparam arrow {
  Thickness 2
  Color #AA0000
  LineStyle dashed
}
skinparam note {
  BackgroundColor #D0D3D4
  BorderColor #4CAF50
  FontColor #17202A
}

title UniGig - Diagrama de Paquetes (Vistas)

package "Views" {

  package "Authentication Views" as AuthViews {
    component "LoginPage"
    component "RegistrationPage"
    component "ForgotPasswordPage"
  }

  package "Dashboard & Navigation Views" as DashboardViews {
    component "UserDashboard"
    component "AdminDashboard"
    component "Header/Footer"
    component "NavigationMenu"
  }

  package "Profile Views" as ProfileViews {
    component "UserProfilePage"
    component "EditProfilePage"
  }

  package "Marketplace Views" as MarketplaceViews {
    component "PublishServicePage"
    component "PublishGigPage"
    component "ServiceListingPage"
    component "GigListingPage"
    component "ServiceDetailPage"
    component "GigDetailPage"
  }

  package "Communication Views" as CommViews {
    component "MessagingInboxPage"
    component "ConversationPage"
    component "ComposeMessagePage"
  }

  package "Project Management Views" as ProjectViews {
    component "ProjectListPage"
    component "ProjectDetailPage"
    component "SubmitDeliverableForm"
    component "ApproveDeliverableForm"
  }

  package "Transaction & Review Views" as TransReviewViews {
    component "PaymentConfirmationPage"
    component "ReviewFormPage"
  }

  package "Administration Views" as AdminViews {
    component "UserManagementPage"
    component "ContentModerationPage"
    component "DisputeManagementPage"
    component "SystemReportsPage"
  }

  note "Este paquete contiene todos los elementos de la interfaz de usuario\nque interactúan directamente con el usuario, presentando información\ny capturando su entrada." as ViewsNote
  ViewsNote .. Views
}

@enduml

## Controllers

@startuml UniGig_Controllers_Diagram

hide empty description

skinparam package {
  BackgroundColor #FFFFCC
  BorderColor #AA0000
  FontColor #17202A
  ArrowColor #AA0000
  BorderThickness 2
}
skinparam component {
  BackgroundColor #E8F8F5
  BorderColor #2ECC71
  FontColor #17202A
}
skinparam arrow {
  Thickness 2
  Color #AA0000
  LineStyle dashed
}
skinparam note {
  BackgroundColor #D0D3D4
  BorderColor #4CAF50
  FontColor #17202A
}

title UniGig - Diagrama de Paquetes (Controladores)

package "Controllers" {

  component "AuthController (Autenticación)"
  component "DashboardController (Panel de Control)"
  component "ProfileController (Gestión de Perfil)"
  component "ServiceController (Servicios)"
  component "GigController (Gigs)"
  component "SearchController (Búsqueda)"
  component "MessageController (Mensajería)"
  component "ProjectController (Proyectos)"
  component "TransactionController (Transacciones)"
  component "AdminController (Administración)"
  component "DisputeController (Disputas)"

  note "Este paquete contiene los controladores que manejan las solicitudes\nHTTP de los usuarios, orquestan las operaciones de negocio\nmediante los Modelos y seleccionan la Vista adecuada para la respuesta." as ControllersNote
  ControllersNote .. Controllers
}

@enduml








