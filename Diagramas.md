## Modelo de dominio

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