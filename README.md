# UniGig-TFG


## Modelo de dominio
@startuml

' --- Classes ---
class User
class Student
class Client
class Service
class Gig
class Category
class ActivityLogs
class Review
class Conversation
class Message

' --- Relationships ---
User <|-- Student : is a
User <|-- Client : is a

Student --> Service : offers >
Client --> Gig : creates >

Service --> Category : belongs to >
Gig --> Category : belongs to >

Gig --> ActivityLogs : has >
ActivityLogs --> Review : may have >

User --> Conversation : participates in >
User <-- Conversation : < participates in
Conversation --> Message : contains >
User --> Message : sends >

@enduml


## Caso de uso autenticacion
@startuml
left to right direction

actor "User" as user

rectangle Sistema {
  (Login) as login
  (Register as Student) as regStudent
  (Register as Client) as regClient
  (Logout) as logout
  (Choose Role) as chooseRole
  (Verify Email) as verifyEmail
}

user --> login
user --> regStudent
user --> regClient
user --> logout

regStudent ..> chooseRole : <<include>>
regClient ..> chooseRole : <<include>>
regStudent ..> verifyEmail : <<include>>

login ..> (Access Dashboard) : <<include>>

note right of verifyEmail
  **Email Validation**:
  - Only university email domains allowed
  - Must be verified before accessing student features
end note

@enduml


## Caso de uso Student

@startuml
left to right direction

actor Student

rectangle Sistema {
  (View Dashboard) as dashboard
  (Create Service) as createService
  (Edit Service) as editService
  (Delete Service) as deleteService
  (Browse Gigs) as browseGigs
  (Apply to Gig) as applyGig
  (View Messages) as viewMessages
  (Send Message) as sendMessage
  (Update Profile) as updateProfile
  (View Activity History) as viewHistory
}

Student --> dashboard
Student --> createService
Student --> editService
Student --> deleteService
Student --> browseGigs
Student --> applyGig
Student --> viewMessages
Student --> sendMessage
Student --> updateProfile
Student --> viewHistory

editService ..> createService : <<extend>>
deleteService ..> createService : <<extend>>
applyGig ..> browseGigs : <<include>>
sendMessage ..> viewMessages : <<include>>

note right of createService
  Service must include:
  - Title
  - Description
  - Price
  - Category
end note

@enduml


## Caso de uso Client

@startuml
left to right direction

actor Client

rectangle Sistema {
  (View Dashboard) as dashboard
  (Create Gig) as createGig
  (Edit Gig) as editGig
  (Delete Gig) as deleteGig
  (Browse Services) as browseServices
  (View Messages) as viewMessages
  (Send Message) as sendMessage
  (Update Profile) as updateProfile
  (Leave Review) as leaveReview
  (Change Gig Status) as changeStatus
}

Client --> dashboard
Client --> createGig
Client --> editGig
Client --> deleteGig
Client --> browseServices
Client --> viewMessages
Client --> sendMessage
Client --> updateProfile
Client --> leaveReview
Client --> changeStatus

editGig ..> createGig : <<extend>>
deleteGig ..> createGig : <<extend>>
sendMessage ..> viewMessages : <<include>>
leaveReview ..> changeStatus : <<include>>

note right of createGig
  Gig must include:
  - Title
  - Description
  - Budget
  - Category
end note

note right of changeStatus
  Status can be:
  - OPEN
  - IN_PROGRESS
  - COMPLETED
  - CANCELLED
end note

@enduml

## Diagrama de contexto cliente 

@startuml
start
:Access UniGig Platform;
:Login / Register;
if (Authenticated?) then (yes)
  :Navigate to Dashboard;
  split
    :Browse Services;
    :Contact Service Providers;
  split again
    :Create New Gig;
    :Manage Existing Gigs;
  :Review Applications;
    if (Accept Application?) then (yes)
      :Change Gig Status to IN_PROGRESS;
      :Communicate with Student;
      :Monitor Progress;
      if (Work Completed?) then (yes)
        :Change Status to COMPLETED;
  :Leave Review;
      else (no)
        :Change Status to CANCELLED;
      endif
    else (no)
      :Continue Reviewing Applications;
    endif
  end split
else (no)
  :Show Login/Registration Screen;
endif
stop
@enduml


## Diagrama de contexto Student
@startuml
start
:Access UniGig Platform;
:Login / Register with University Email;
if (Authenticated?) then (yes)
  :Navigate to Dashboard;
  split
      :Browse Available Gigs;
    if (Find Interesting Gig?) then (yes)
      :Apply for Gig;
      :Start Conversation with Client;
      if (Selected for Gig?) then (yes)
        :Receive Status Update (IN_PROGRESS);
        :Work on Gig;
        :Communicate Progress;
        if (Complete Work?) then (yes)
          :Request Status Change to COMPLETED;
          :Receive Review;
      else (no)
          :Request Status Change to CANCELLED;
        endif
      endif
    endif
  split again
    :Manage Services;
    split
      :Create New Service;
    split again
      :Edit Existing Service;
    split again
      :Delete Service;
    end split
    :Monitor Service Inquiries;
  end split
else (no)
  :Show Login/Registration Screen;
endif
stop
@enduml


## diagrama de modelos 
@startuml

package "Models" {
    class User {
        +id: String
        +name: String
        +email: String
        +password: String
        +role: String
    }

    class Student {
        +id: String
        +userId: String
    }

    class Client {
        +id: String
        +userId: String
    }

    class Service {
        +id: String
        +title: String
        +description: String
        +price: Float
        +studentId: String
        +categoryId: String
    }

    class Category {
        +id: String
        +name: String
        +description: String
    }

    class Gig {
        +id: String
        +title: String
        +description: String
        +budget: Float
        +status: String
        +clientId: String
        +categoryId: String
    }

    class ActivityLogs {
        +id: String
        +action: String
        +userId: String
        +gigId: String
        +createdAt: DateTime
    }

    class Review {
        +id: String
        +rating: Int
        +comment: String
        +activityLogId: String
    }

    class Conversation {
        +id: String
    }

    class Message {
        +id: String
        +content: String
        +senderId: String
        +conversationId: String
        +createdAt: DateTime
    }
}

@enduml

## Diagrama de controladores
@startuml
package "Controllers" {
  class AuthController {
    +login()
    +register()
    +logout()
    +verifyEmail()
  }

  class UserController {
    +getProfile()
    +updateProfile()
  }

  class ServiceController {
    +create()
    +getAll()
    +getById()
    +update()
    +delete()
  }

  class GigController {
    +create()
    +getAll()
    +getById()
    +update()
    +delete()
    +updateStatus()
    +apply()
  }

  class CategoryController {
    +getAll()
    +getById()
  }

  class ConversationController {
    +create()
    +getAll()
    +getById()
    +sendMessage()
  }

  class ActivityLogController {
    +create()
    +getByGigId()
  }

  class ReviewController {
    +create()
    +getByGigId()
  }
}
@enduml

## Vistas
@startuml

package "Views" {
  package "Auth" {
    class "Login Page"
    class "Register Page"
    class "Email Verification Page"
  }

  package "Dashboard" {
    class "Student Dashboard" {
      +Services List
      +Applied Gigs
      +Messages
    }
    class "Client Dashboard" {
      +My Gigs
      +Messages
      +Browse Services
    }
  }

  package "Services" {
    class "Services List"
    class "Service Details"
    class "Create Service"
    class "Edit Service"
  }

  package "Gigs" {
    class "Gigs List"
    class "Gig Details"
    class "Create Gig"
    class "Edit Gig"
  }

  package "Messages" {
    class "Conversations List"
    class "Chat View"
  }

  package "Profile" {
    class "View Profile"
    class "Edit Profile"
}

  package "Common" {
    class "Navigation"
    class "Category Filter"
    class "Search Bar"
    class "Back Button"
  }
}

@enduml


## detallar caso de uso publicar servicio

@startuml
title Detalle Caso de Uso: Publicar servicio (Sequence)

actor "Estudiante" as Student
participant "Interfaz de usuario (UI)" as UI
participant "Service controller" as Controller
participant "Modelo (Service)" as ServiceModel
database "Base de Datos" as Database

Student -> UI : Inicia "Publicar servicio"
UI -> Controller : Solicitar formulario creación servicio
Controller -> UI : Presentar formulario creación servicio

Student -> UI : Completa y envía formulario (datos del servicio)
UI -> Controller : Enviar datos del servicio

Controller -> ServiceModel : Validar datos servicio
alt Datos válidos
  ServiceModel --> Controller : Validación exitosa
  Controller -> ServiceModel : Crear y publicar servicio
  ServiceModel -> Database : Guardar servicio
  Database --> ServiceModel : Confirmar guardado
  ServiceModel --> Controller : Confirmar creación y publicación
  Controller --> UI : Confirmar Publicación exitosa
  UI --> Student : Mostrar confirmación

else Datos inválidos
  ServiceModel --> Controller : Validación fallida (errores)
  Controller --> UI : Enviar errores de validación
  UI --> Student : Mostrar errores
  Student -> UI : Corregir datos
  UI -> Controller : Enviar datos corregidos // Bucle para corregir
end

@enduml


## detallar caso de uso publicar gig

@startuml
title Detalle caso de uso: Publicar Gig

actor "Cliente" as Client
participant "Interfaz de usuario (UI)" as UI
participant "Gig controller" as Controller
participant "Modelo (Gig)" as GigModel
database "Base de Datos" as Database

Client -> UI : Inicia "Publicar Gig"
UI -> Controller : Solicitar formulario creación gig
Controller -> UI : Presentar formulario creación gig

Client -> UI : Completa y envía formulario (datos del gig)
UI -> Controller : Enviar datos del gig

Controller -> GigModel : Validar datos del gig
alt Datos válidos
  GigModel --> Controller : Validación exitosa
  Controller -> GigModel : Crear y publicar gig
  GigModel -> Database : Guardar Gig
  Database --> GigModel : Confirmar guardado
  GigModel --> Controller : Confirmar creación y publicación
  Controller --> UI : Confirmar publicación exitosa
  UI --> Client : Mostrar confirmación

else Datos inválidos
  GigModel --> Controller : Validación fallida (errores)
  Controller --> UI : Enviar errores de validación
  UI --> Client : Mostrar errores
  Client -> UI : Corregir datos
  UI -> Controller : Enviar datos corregidos
end

@enduml

## detallar caso de uso dejar reseña client

@startuml
title Detalle caso de uso: Dejar reseña (Sequence)

actor "Cliente" as Client
participant "Interfaz de usuario (UI)" as UI
participant "ReviewController" as Controller
participant "Modelo (Review)" as ReviewModel
participant "Modelo (Student)" as StudentModel
database "Base de datos" as Database

Client -> UI : Accede a Gig completado\n y selecciona "Dejar reseña"
UI -> Controller : Solicitar formulario reseña (id_gig)
Controller -> ReviewModel : Obtener Info Gig/Estudiante (id_gig)
ReviewModel --> Controller : Devolver Info necesaria
Controller -> UI : Presentar formulario reseña

Client -> UI : Completa y envía reseña (puntuación, comentario)
UI -> Controller : Enviar datos reseña

Controller -> ReviewModel : Validar datos reseña
alt Datos válidos
  ReviewModel --> Controller : Validación exitosa
  Controller -> ReviewModel : Crear reseña (datos, id_gig, id_cliente, id_estudiante)
  ReviewModel -> Database : Guardar reseña
  Database --> ReviewModel : Confirmar guardado
  ReviewModel --> Controller : Confirmar creación reseña

  Controller -> StudentModel : Actualizar rating estudiante (id_estudiante)
  StudentModel -> Database : Actualizar reviews
  Database --> StudentModel : Confirmar actualización
  StudentModel --> Controller : Confirmar actualización reviews

  Controller --> UI : Confirmar envío reseña exitosa
  UI --> Client : Mostrar confirmación

  ' Opcional: Notificar al estudiante
  Controller -> Notification : Enviar notificación estudiante (nueva reseña)

else Datos inválidos
  ReviewModel --> Controller : Validación fallida (errores)
  Controller --> UI : Enviar Errores de validación
  UI --> Client : Mostrar Errores
  Client -> UI : Corregir Datos Reseña
  UI -> Controller : Enviar datos corregidos
end

@enduml

## Diagrama de Flujo de Activity Logs
@startuml
title Activity Log Flow

start

partition "Gig Creation" {
  :Client Creates Gig;
  :Log "GIG_CREATED";
}

partition "Application Process" {
  :Student Applies to Gig;
  :Log "STUDENT_APPLIED";
}

partition "Status Changes" {
  fork
    :Change to IN_PROGRESS;
    :Log "GIG_STATUS_CHANGED_TO_IN_PROGRESS";
  fork again
    :Change to COMPLETED;
    :Log "GIG_STATUS_CHANGED_TO_COMPLETED";
    :Client Leaves Review;
    :Log "REVIEW_CREATED";
  fork again
    :Change to CANCELLED;
    :Log "GIG_STATUS_CHANGED_TO_CANCELLED";
  end fork
}

partition "Gig Updates" {
  fork
    :Client Updates Gig;
    :Log "GIG_UPDATED";
  fork again
    :Client Deletes Gig;
    :Log "GIG_DELETED";
  end fork
}

stop

note right
  All activity logs include:
  - Action type
  - User ID
  - Gig ID
  - Timestamp
end note

@enduml

## Diagrama de Flujo de Mensajes
@startuml
title Messaging Flow

actor Student
actor Client
participant "Conversation system" as System
database "Database" as DB

== Conversation initiation ==
Student -> System: Apply for Gig
activate System
System -> DB: Create conversation
System -> DB: Save initial message
System --> Client: Notify new conversation
deactivate System

== Message exchange ==
group Message Loop
  Client -> System: Send message
  activate System
  System -> DB: Save message
  System --> Student: Deliver message
  deactivate System

  Student -> System: Reply message
  activate System
  System -> DB: Save message
  System --> Client: Deliver message
  deactivate System
end

== Conversation management ==
group Conversation List
  Student -> System: View conversations
  activate System
  System -> DB: Fetch conversations
  System --> Student: Display list
  deactivate System

  Client -> System: View conversations
  activate System
  System -> DB: Fetch conversations
  System --> Client: Display list
  deactivate System
end

note right
  Each message contains:
  - Content
  - Sender ID
  - Timestamp
  - Conversation ID
end note

@enduml

## Diagrama Entidad Relación
@startuml

entity "User" as user {
}

entity "Student" as student {
}

entity "Client" as client {
}

entity "Service" as service {
}

entity "Category" as category {
}

entity "Gig" as gig {
}

entity "ActivityLogs" as logs {
}

entity "Review" as review {
}

entity "Conversation" as conversation {
}

entity "Message" as message {
}

' Relationships
user ||--o{ student : has
user ||--o{ client : has

student ||--o{ service : offers >
client ||--o{ gig : creates >

service }o--|| category : belongs to >
gig }o--|| category : belongs to >

gig ||--o{ logs : has >
logs ||--o| review : may have >

user }o--o{ conversation : participates in
conversation ||--o{ message : contains >
user ||--o{ message : sends >

@enduml

## Detailed UML Diagrams

### Domain Model with Types
@startuml

entity User {
  + id
  + name
  + email
  + password
  + role
}

note left of User
 The system manages
 user authentication and
 authorization.
end note

entity Student {
  + id
  + universityEmail
  + skills
}

entity Client {
  + id
  + companyName
  + contactInfo
}

entity Service {
  + id
  + title
  + description
  + price
  + category
}

entity Gig {
  + id
  + title
  + description
  + budget
  + status
}

entity Category {
  + id
  + name
  + description
}

entity Review {
  + id
  + rating
  + comment
  + date
}

entity Message {
  + id
  + content
  + timestamp
}

UniGigSystem --- User: Manages
UniGigSystem .. Student: > Creates and deletes
UniGigSystem .. Client: > Creates and deletes
Student -left- Service:> offers
Client -right- Gig:> creates
Service --- Category: belongs to
Gig --- Category: belongs to
Gig --- Review: receives
Message --- User: sent by
Student --- Review: receives
Client --- Review: gives

@enduml

### Student Context Diagram
@startuml

hide empty description

[*] --> START
START --> UniGigPlatform
note on link
    Login with University Email
end note

UniGigPlatform --> [*]
note on link
    Logout
end note

state UniGigPlatform {
    [*] --> MainDashboard
    MainDashboard --> ManageServices
    note on link
        Create Service
        Edit Service
        Delete Service
        View Service History
    end note
    ManageServices --> ManageServices
    note on link
        Create Service
        Edit Service
        Delete Service
        View Service History
    end note
    ManageServices --> MainDashboard
        note on link
            Return to dashboard
        end note

    MainDashboard --> BrowseGigs
    note on link
        View Available Gigs
        Apply to Gigs
    end note
    BrowseGigs --> BrowseGigs
    BrowseGigs --> MainDashboard
    note on link
        Return to dashboard
    end note

    MainDashboard --> ManageProfile
    note on link
        Update Skills
        Update Portfolio
    end note
    ManageProfile --> ManageProfile
    ManageProfile --> MainDashboard
    note on link
        Return to dashboard
    end note

    MainDashboard --> ManageMessages
    note on link
        View Messages
        Send Messages
    end note
    ManageMessages --> ManageMessages
    note on link
        View Messages
        Send Messages
    end note
    ManageMessages --> MainDashboard
     note on link
        Return to dashboard
    end note
}
@enduml

### Client Context Diagram
@startuml

hide empty description

[*] --> START
START --> UniGigPlatform
note on link
    Login
end note

UniGigPlatform --> [*]
note on link
    Logout
end note

state UniGigPlatform {
    [*] --> MainDashboard
    note on link
        Different dashboard for
        each user type
    end note

    MainDashboard --> ManageGigs
    note on link
        View My Gigs
    end note
    
    ManageGigs --> ManageGigs
    note on link
        Create Gigs
        Update Gigs
        Delete Gigs
        View Gigs
    end note
    ManageGigs --> MainDashboard
    note on link
        Return to dashboard
    end note

    MainDashboard --> BrowseServices
    note on link
        View Available Services
    end note

    BrowseServices --> MainDashboard
    note on link
        Return to dashboard
    end note

    MainDashboard --> ManageProfile
    note on link
        Update Profile
    end note
    ManageProfile --> ManageProfile
    ManageProfile --> MainDashboard
    note on link
        Return to dashboard
    end note

    MainDashboard --> ManageMessages
    note on link
        View Messages
    end note
    ManageMessages --> ManageMessages
    note on link
        Send Messages
        View Messages
        Archive Messages
    end note
    ManageMessages --> MainDashboard
    note on link
        Return to dashboard
    end note

    MainDashboard --> ManageReviews
    note on link
        View Reviews
    end note
    ManageReviews --> ManageReviews
    note on link
        Create Reviews
        Update Reviews
        Delete Reviews
        View Reviews
    end note
    ManageReviews --> MainDashboard
    note on link
        Return to dashboard
    end note
}
@enduml

### State Diagrams

#### Gig State Diagram
@startuml
hide empty description
[*] --> OPEN
OPEN --> IN_PROGRESS
IN_PROGRESS --> COMPLETED
IN_PROGRESS --> CANCELLED
COMPLETED --> [*]
CANCELLED --> [*]
@enduml

#### User State Diagram
@startuml
hide empty description
[*] --> NotLoggedIn
NotLoggedIn --> CreateAccount : No account
CreateAccount --> EnterData
EnterData --> ValidateData
ValidateData --> AccountCreated : Valid Data
ValidateData --> CreateAccount : Invalid Data
AccountCreated --> NotLoggedIn
NotLoggedIn --> EnterCredentials : Has Account
note right of EnterCredentials
 email (@university.edu)
 and password
end note
EnterCredentials --> ValidateCredentials 
ValidateCredentials --> NotLoggedIn : Invalid credentials
ValidateCredentials --> LoggedIn : Valid credentials
LoggedIn --> System : Access system
System --> [*]
@enduml

### Object Diagram
@startuml

object UniGigSystem
object Service {
   title : "Web Development"
   description: "Full-stack web development services"
   price: $50/hour
   category: "Development"
}
object Student {
   name: JaneDoe
   email: jane.doe@university.edu
   skills: ["JavaScript", "React", "Node.js"]
}
object Gig {
   title: "E-commerce Website" 
   budget: $2000
   status: OPEN
}
object Review {
   rating: 5
   comment: "Excellent work!"
   date: 2024-03-20
}
object Category {
   name: "Development"
   description: "Software development services"
}


UniGigSystem .. Student :> Creates and manages
UniGigSystem --- Service : Manages
Student --left- Service:> offers
Service --- Category: belongs to
Service --- Review: receives
Review --- Student : < rates service

@enduml

### Use Cases

#### Service Management
@startuml

left to right direction

actor Student as S

package Services {
    usecase "Create Service" as UC1
    usecase "View Services" as UC2
    usecase "Update Service" as UC3
    usecase "Delete Service" as UC4
}

S --> UC1
S --> UC2
S --> UC3
S --> UC4

@enduml

#### Gig Management
@startuml

left to right direction

actor Client as C

package Gigs {
    usecase "Create Gig" as UC1
    usecase "View Gigs" as UC2
    usecase "Update Gig" as UC3
    usecase "Delete Gig" as UC4
    usecase "Change Gig Status" as UC5
}

C --> UC1
C --> UC2
C --> UC3
C --> UC4
C --> UC5

@enduml

### Detailed Use Cases

#### Create Service Flow
@startuml
title Create Service (Student)

[*] --> Start
note right on link
 The **student** starts from the
 application homepage
end note

Start --> ServiceForm
note right on link
 The **student** navigates to the service
 creation form
end note

ServiceForm --> ValidateData
note right on link
 The **student** completes all required
 service parameters in the form
end note

ValidateData --> ServiceCreated
note right on link
 The **system** validates and creates
 the service
end note

ServiceCreated --> [*]
note right on link
 The **system** confirms service
 creation to the student
end note

@enduml

#### Create Gig Flow
@startuml
title Create Gig (Client)

[*] --> Start
note right on link
The **client** starts from the
application homepage
end note

Start --> GigForm
note right on link
The **client** navigates to the gig
creation form
end note

GigForm --> ValidateData
note right on link
The **client** completes all required
gig parameters in the form
end note

ValidateData --> GigCreated
note right on link
The **system** validates and creates
the gig
end note

GigCreated --> [*]
note right on link
The **system** confirms gig
creation to the client
end note

@enduml

#### Leave Review Flow
@startuml
title Leave Review (Client)

[*] --> ViewCompletedGig
note on link
 The **client** accesses the completed
 gig details
end note

ViewCompletedGig --> CreateReview
note on link
 The **client** selects the option
 to leave a review
end note

CreateReview --> EnterReviewDetails
note on link
 The **client** enters rating and
 comments for the review
end note

EnterReviewDetails --> ConfirmReview
note on link
 The **system** validates the review
 details
end note

ConfirmReview --> ReviewSubmitted
note on link
 The **system** saves and publishes
 the review
end note

ReviewSubmitted --> [*]
note on link
 The **system** confirms review
 submission to the client
end note

@enduml

@enduml

