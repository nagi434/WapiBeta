import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  Users, 
  MessageSquare, 
  Clock, 
  BarChart3,
  Send,
  Upload,
  Mail,
  Phone,
  LogOut,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Search,
  Pencil
} from 'lucide-react'
import { useContacts } from './hooks/useContacts'
import { useMessages, useWhatsApp } from './hooks/useMessages'
import { useStats } from './hooks/useStats'
import { useConfig } from './hooks/useConfig'
import { authService, sendWhatsAppMessage } from './services/api'
import WaQr from './components/ui/waqr'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentSection, setCurrentSection] = useState('mensajes')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Estado global para mensajes programados y enviados
  const [scheduledMessages, setScheduledMessages] = useState([])
  const [sentMessages, setSentMessages] = useState([])

  const { whatsappStatus } = useConfig();

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginData.username || !loginData.password) {
      setLoginError('Por favor ingresa usuario y contraseña')
      return
    }

    setLoginLoading(true)
    setLoginError('')

    try {
      const response = await authService.login(loginData)
      if (response.success) {
        setIsLoggedIn(true)
        setCurrentSection('mensajes')
        setLoginError('')
      }
    } catch (error) {
      setLoginError('Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setLoginLoading(false)
    }
  }

  const [logoutError, setLogoutError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setLogoutError(null);
    
    try {
      const result = await authService.logout();
      console.log(result.message);
      
      // Mostrar mensaje de éxito
      alert(result.message);
      
      // Limpiar estado
      setIsLoggedIn(false);
      setLoginData({ username: '', password: '' });
      setCurrentSection('mensajes');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setLogoutError(error.message || 'Error al cerrar sesión');
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoggingOut(false);
    }
  }

  const menuItems = [
    { id: 'contactos', label: 'Contactos', icon: Users },
    { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
    { id: 'historial', label: 'Historial y Programados', icon: Clock }
  ]

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Send className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">PIsky</CardTitle>
            <CardDescription className="text-gray-600">
              Gestión de mensajes promocionales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className="h-11"
                  disabled={loginLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="h-11"
                  disabled={loginLoading}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:transform-none`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PIsky</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="mt-6 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentSection(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 text-left rounded-lg transition-colors ${
                  currentSection === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-white lg:static lg:bg-transparent">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 capitalize">
              {menuItems.find(item => item.id === currentSection)?.label || 'PIsky'}
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            Bienvenido, {loginData.username}
          </div>
        </header>

        {/* Content */}
        <main className="p-6">

          {currentSection === 'contactos' && <ContactosSection />}
          {currentSection === 'mensajes' && (
            <MensajesSection
              scheduledMessages={scheduledMessages}
              setScheduledMessages={setScheduledMessages}
              sentMessages={sentMessages}
              setSentMessages={setSentMessages}
            />
          )}
          {currentSection === 'historial' && (
            <div className="space-y-8">
              <HistorialSection sentMessages={sentMessages} />
              <ProgramadosSection scheduledMessages={scheduledMessages} />
            </div>
          )}
        </main>
      </div>
      {/* El componente WaQr ahora se maneja dentro de MensajesSection */}
    </div>
  )
}

// Componentes de las secciones
function InicioSection() {
  const { dashboardStats, loading, error } = useStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando información...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido a Apisky</CardTitle>
          <CardDescription>
            Tu plataforma para la gestión de mensajes promocionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              Comienza a utilizar la plataforma seleccionando una opción del menú lateral.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Gestiona tus contactos en la sección <strong>Contactos</strong></li>
              <li>Envía mensajes masivos en <strong>Mensajes</strong></li>
              <li>Revisa tu historial en <strong>Historial y estadísticas</strong></li>
              <li>Configura tu cuenta en <strong>Configuración</strong></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ContactosSection() {
  const { 
    contacts, 
    loading, 
    error, 
    importContacts,
    refreshContacts,
    assignSegment,
    availableSegments
  } = useContacts()
  
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [segmentFilter, setSegmentFilter] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingContact, setEditingContact] = useState(null)
  const [newSegment, setNewSegment] = useState('')
  const [showCreateSegment, setShowCreateSegment] = useState(false)
  const [segmentName, setSegmentName] = useState('')
  const [selectedContacts, setSelectedContacts] = useState([])
  const [contactSearch, setContactSearch] = useState('')

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setImportLoading(true)
    setImportResult(null)

    try {
      const result = await importContacts(file)
      setImportResult(result)
    } catch (err) {
      setImportResult({ 
        success: false, 
        message: 'Error al importar contactos' 
      })
    } finally {
      setImportLoading(false)
    }
  }

  // Función para manejar la selección de contactos
  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  // Función para crear un nuevo segmento
  const handleCreateSegment = async () => {
    if (!segmentName.trim()) return
    
    try {
      // Aquí iría la llamada a la API para crear el segmento
      // await createSegment(segmentName, selectedContacts);
      
      // Actualizar contactos en el estado local para reflejar los cambios inmediatamente
      const selectedNumbers = contacts
        .filter(c => selectedContacts.includes(c.id))
        .map(c => c.number);
      assignSegment(segmentName, selectedNumbers);

      // (Opcional) Refrescar desde backend si es necesario
      // await refreshContacts()
      
      // Limpiar el formulario
      setSegmentName('')
      setSelectedContacts([])
      setShowCreateSegment(false)
      
      // Mostrar mensaje de éxito
      alert(`Segmento "${segmentName}" creado exitosamente`)
    } catch (error) {
      console.error('Error al crear el segmento:', error)
      alert('Error al crear el segmento. Por favor, inténtalo de nuevo.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Contactos</h2>
            <p className="text-gray-600">Administra y organiza tu base de contactos</p>
          </div>
          <div className="w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar contactos..."
                className="pl-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="w-full sm:w-auto">
            <Label htmlFor="segment-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por segmento:
            </Label>
            <div className="flex gap-2">
              <select
                id="segment-filter"
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3 border"
              >
                {availableSegments.map(segment => (
                  <option key={segment} value={segment}>
                    {segment === 'todos' ? 'Todos los segmentos' : segment}
                  </option>
                ))}
              </select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSegmentFilter('todos')}
                className="whitespace-nowrap"
              >
                Limpiar filtro
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setShowCreateSegment(true)}
                className="whitespace-nowrap bg-green-600 hover:bg-green-700"
              >
                + Crear segmento
              </Button>
            </div>
          </div>
          <div className="relative">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={importLoading}
            />
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={importLoading}
            >
              {importLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir CSV/Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {importResult && (
        <Alert variant={importResult.success ? "default" : "destructive"}>
          {importResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {importResult.success 
              ? `Importación exitosa: ${importResult.imported} contactos importados, ${importResult.duplicates} duplicados, ${importResult.failed} fallidos.`
              : importResult.message}
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando contactos...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Contactos</CardTitle>
            <CardDescription>Total: {contacts.length} contactos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segmento</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts
                    .filter(contact => {
                      const matchesSearch = searchTerm === '' || 
                        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        contact.number?.includes(searchTerm);
                      const matchesSegment = segmentFilter === 'todos' || contact.segment === segmentFilter;
                      return matchesSearch && matchesSegment;
                    })
                    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                    .map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contact.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {contact.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {editingContact === contact.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={newSegment}
                                onChange={(e) => setNewSegment(e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nuevo segmento"
                              />
                              <Button 
                                size="sm" 
                                onClick={async () => {
                                  // Aquí iría la llamada a la API para actualizar el segmento
                                  try {
                                    // await updateContactSegment(contact.id, newSegment);
                                    await refreshContacts();
                                    setEditingContact(null);
                                  } catch (error) {
                                    console.error('Error al actualizar segmento:', error);
                                  }
                                }}
                              >
                                Guardar
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setEditingContact(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="capitalize">{contact.segment || 'Sin segmento'}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                onClick={() => {
                                  setEditingContact(contact.id);
                                  setNewSegment(contact.segment || '');
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para crear segmento */}
      {showCreateSegment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Crear Nuevo Segmento</h3>
              <button 
                onClick={() => {
                  setShowCreateSegment(false)
                  setSegmentName('')
                  setSelectedContacts([])
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="segment-name">Nombre del segmento</Label>
                <Input
                  id="segment-name"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  placeholder="Ej: Clientes frecuentes, Proveedores, etc."
                  className="mt-1"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Seleccionar contactos ({selectedContacts.length} seleccionados)</Label>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar contactos..."
                      className="pl-10 h-8 text-sm"
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                  {contacts.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input 
                              type="checkbox"
                              checked={selectedContacts.length === contacts.length && contacts.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedContacts(contacts.map(c => c.id))
                                } else {
                                  setSelectedContacts([])
                                }
                              }}
                              className="rounded"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contacts
                          .filter(contact => 
                            contact.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                            contact.number?.includes(contactSearch)
                          )
                          .map((contact) => (
                          <tr key={contact.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedContacts.includes(contact.id)}
                                onChange={() => toggleContactSelection(contact.id)}
                                className="rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {contact.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {contact.number}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="p-4 text-gray-500 text-center">No hay contactos disponibles</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateSegment(false)
                    setSegmentName('')
                    setSelectedContacts([])
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateSegment}
                  disabled={!segmentName.trim() || selectedContacts.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Crear segmento
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MensajesSection({ scheduledMessages, setScheduledMessages, sentMessages, setSentMessages }) {
  const { sendMessage, loading, error } = useMessages()
  const { whatsappStatus, checkWhatsappStatus } = useConfig()
  const { contacts, loading: contactsLoading, error: contactsError } = useContacts()
  const [messageContent, setMessageContent] = useState('')
  const [selectedContacts, setSelectedContacts] = useState([])
  const [waResult, setWaResult] = useState(null)
  const [waLoading, setWaLoading] = useState(false)
  const [schedule, setSchedule] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [manualNumber, setManualNumber] = useState('')
  const [imageFile, setImageFile] = useState(null)
  // Buscador de contactos
  const [search, setSearch] = useState('')
  // Números adicionales (no en contactos)
  const [additionalNumbers, setAdditionalNumbers] = useState('')

  // Efecto robusto para envío programado: un solo intervalo global
  useEffect(() => {
    let isProcessing = false;
    const timer = setInterval(async () => {
      if (isProcessing) return;
      isProcessing = true;
      setScheduledMessages((msgs) => {
        const now = new Date();
        // Buscar el primer mensaje pendiente y listo para enviar
        const idx = msgs.findIndex(
          (msg) => msg.status === 'Pendiente' && msg.date && !isNaN(new Date(msg.date).getTime()) && new Date(msg.date) <= now
        );
        if (idx === -1) return msgs;
        const msg = msgs[idx];
        // Marcar como Enviando
        const updatedMsgs = msgs.map((m, i) =>
          i === idx ? { ...m, status: 'Enviando' } : m
        );
        // Enviar fuera del setState para evitar problemas de concurrencia
        setTimeout(async () => {
          for (const to of msg.recipients) {
            try {
              await sendWhatsAppMessage({ to, message: msg.content });
            } catch (err) {
              console.error('Error enviando mensaje programado:', err);
            }
          }
          setScheduledMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id ? { ...m, status: 'Enviado', sentAt: new Date().toISOString() } : m
            )
          );
          setSentMessages((prev) =>
            prev.some((m) => m.id === msg.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: msg.id,
                    content: msg.content,
                    recipients: msg.recipients,
                    date: msg.date,
                    sentAt: new Date().toISOString(),
                    status: 'Enviado',
                  },
                ]
          );
        }, 0);
        return updatedMsgs;
      });
      isProcessing = false;
    }, 1000);
    return () => clearInterval(timer);
  }, [setScheduledMessages, setSentMessages])

  const handleContactCheck = (number) => {
    setSelectedContacts((prev) =>
      prev.includes(number)
        ? prev.filter((n) => n !== number)
        : [...prev, number]
    )
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setWaResult({ success: false, message: 'La imagen no debe superar los 10MB' });
      return;
    }

    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    // Limpiar el input file
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSendWhatsApp = async (e) => {
    e.preventDefault();
    setWaResult(null);
    
    if (!messageContent.trim() && !imageFile) {
      setWaResult({ success: false, message: 'Por favor ingresa un mensaje o adjunta una imagen' });
      return;
    }
    
    // Procesar números adicionales (soporte internacional)
    const additionalNumbersList = additionalNumbers
      .split(',')
      .map(num => num.trim())
      .filter(num => {
        if (!num) return false;
        
        // Eliminar todo lo que no sea dígito o signo +
        const cleanNum = num.replace(/[^\d+]/g, '');
        
        // Validar formato internacional
        const isValid = /^(\+\d{1,3})?\d{8,15}$/.test(cleanNum);
        
        if (!isValid) {
          console.warn(`Formato de número inválido: ${num}`);
          return false;
        }
        
        // Asegurar que tenga el prefijo +
        return cleanNum.startsWith('+') ? cleanNum : `+${cleanNum}`;
      });
    
    // Combinar contactos seleccionados con números adicionales
    const allRecipients = [...new Set([...selectedContacts, ...additionalNumbersList])];
    
    if (allRecipients.length === 0) {
      setWaResult({ 
        success: false, 
        message: 'Selecciona al menos un contacto o ingresa números internacionales válidos (ej: +51974672423, +573001234567)' 
      });
      return;
    }

    setWaLoading(true);
    try {
      if (schedule && scheduledDate) {
        // Guardar mensaje programado en el estado global
        setScheduledMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            content: messageContent,
            imageUrl: imagePreview,
            recipients: selectedContacts,
            date: scheduledDate,
            status: 'Pendiente',
          },
        ]);
        setWaResult({ success: true, message: 'Mensaje programado correctamente.' });
      } else {
        // Envío inmediato a todos los seleccionados + números adicionales
        for (const to of allRecipients) {
          await sendWhatsAppMessage({ 
            to, 
            message: messageContent,
            imageFile: imageFile,
            caption: messageContent
          });
        }
        
        // Guardar en historial de enviados
        setSentMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            content: messageContent,
            imageUrl: imagePreview,
            recipients: selectedContacts,
            date: new Date().toISOString(),
            status: 'Enviado',
          },
        ]);
        
        setWaResult({ success: true, message: 'Mensaje(s) enviado(s) correctamente.' });
      }
      
      // Limpiar formulario
      setMessageContent('');
      setSelectedContacts([]);
      setScheduledDate('');
      setSchedule(false);
      setImagePreview(null);
      setImageFile(null);
      const fileInput = document.getElementById('image-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setWaResult({ success: false, message: err.message });
    } finally {
      setWaLoading(false);
    }
  };

  // Si WhatsApp aún no está conectado, mostrar el QR y salir temprano
  if (!whatsappStatus.connected) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Conectar WhatsApp</h2>
        <p className="text-gray-600">Escanea el QR para conectar tu sesión y comenzar a enviar mensajes.</p>
        <WaQr />
        <div className="flex justify-center">
          <Button onClick={checkWhatsappStatus} className="mt-4">Ya escaneé el QR</Button>
        </div>
      </div>
    )
  }

  // Filtrar contactos por búsqueda y segmento
  const filteredContacts = contacts
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .filter(contact =>
      contact.name?.toLowerCase().includes(search.toLowerCase()) ||
      contact.number?.toLowerCase().includes(search.toLowerCase()) ||
      (contact.segment && contact.segment.toLowerCase().includes(search.toLowerCase()))
    )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Crear y Enviar Mensajes</h2>
      <p className="text-gray-600">Redacta tu mensaje y selecciona los destinatarios.</p>

      <Card>
        <CardHeader>
          <CardTitle>Contenido del Mensaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSendWhatsApp} className="space-y-4">
            {/* Vista previa de la imagen */}
            {imagePreview && (
              <div className="relative border rounded-lg p-2">
                <img 
                  src={imagePreview} 
                  alt="Vista previa" 
                  className="max-h-40 mx-auto rounded"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  title="Eliminar imagen"
                >
                  ×
                </button>
              </div>
            )}
            
            {/* Botón para subir imagen */}
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                📷 Adjuntar Imagen
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              <span className="text-xs text-gray-500">
                Formatos: JPG, PNG, WebP (máx. 10MB)
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="messageContent">Mensaje</Label>
              <textarea
                id="messageContent"
                rows="6"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Escribe tu mensaje aquí..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Destinatarios</Label>
              
              {/* Números seleccionados */}
              {selectedContacts.length > 0 && (
                <div className="mb-2 p-2 border rounded bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Seleccionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedContacts.map((number, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded"
                      >
                        {number}
                        <button 
                          onClick={() => setSelectedContacts(prev => prev.filter(n => n !== number))}
                          className="ml-1.5 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Buscador de contactos */}
              <Input
                type="text"
                placeholder="Buscar contacto..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mb-2"
              />

              {/* Lista de contactos */}
              <div className="border rounded p-2 max-h-48 overflow-y-auto bg-gray-50">
                {contactsLoading ? (
                  <div className="text-gray-500 text-center py-2">Cargando contactos...</div>
                ) : contactsError ? (
                  <div className="text-red-500 text-center py-2">Error al cargar contactos</div>
                ) : filteredContacts.length > 0 ? (
                  filteredContacts.map(contact => (
                    <div 
                      key={contact.id} 
                      className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => {
                        if (!selectedContacts.includes(contact.number)) {
                          setSelectedContacts(prev => [...prev, contact.number]);
                        }
                      }}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.number}</p>
                      </div>
                      {selectedContacts.includes(contact.number) && (
                        <span className="text-green-500">✓</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-2">No se encontraron contactos</div>
                )}
              </div>

              {/* Campo para números adicionales */}
              <div className="mt-3">
                <Label>Agregar números manualmente (separados por comas)</Label>
                <Input
                  type="text"
                  placeholder="Ej: +51974672423, +573001234567"
                  value={additionalNumbers}
                  onChange={(e) => setAdditionalNumbers(e.target.value)}
                  className="text-sm py-2 mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa números con código de país (ej: +51...)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="schedule"
                checked={schedule}
                onChange={e => setSchedule(e.target.checked)}
              />
              <Label htmlFor="schedule">Programar mensaje</Label>
              {schedule && (
                <input
                  type="datetime-local"
                  className="ml-2 border rounded px-2 py-1"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  required={schedule}
                />
              )}
            </div>
            <Button type="submit" disabled={waLoading || !messageContent || selectedContacts.length === 0 || (schedule && !scheduledDate)} className="w-full">
              {waLoading ? (schedule ? 'Programando...' : 'Enviando...') : (schedule ? 'Programar Mensaje' : 'Enviar WhatsApp')}
            </Button>
            {waResult && (
              <div className={waResult.success ? 'text-green-600' : 'text-red-600'}>
                {waResult.message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function ProgramadosSection({ scheduledMessages }) {
  // Reloj en tiempo real
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-6 mt-12">
      <h2 className="text-2xl font-bold text-gray-900">Mensajes Programados</h2>
      <p className="text-gray-600">Revisa y gestiona tus mensajes programados.</p>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatarios</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scheduledMessages.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4 text-gray-400">No hay mensajes programados.</td></tr>
                ) : scheduledMessages.map((msg) => (
                  <tr key={msg.id}>
                    <td className="px-6 py-4 whitespace-pre-wrap text-sm font-medium text-gray-900">{msg.content}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{msg.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        msg.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        msg.status === 'Enviado' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{msg.recipients.length} contacto(s)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function HistorialSection({ sentMessages, scheduledMessages }) {
  const { historyStats, loading, error } = useStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando historial...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const totalSent = sentMessages.length;
  const delivered = sentMessages.filter(msg => msg.status === 'Enviado').length;
  const failed = totalSent - delivered;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Historial de Mensajes</h2>
      <p className="text-gray-600">Revisa el historial de tus mensajes enviados.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Enviados</p>
              <p className="text-3xl font-bold text-gray-900">{totalSent}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Entregados</p>
              <p className="text-3xl font-bold text-green-600">{delivered}</p>
              {totalSent > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {((delivered / totalSent) * 100).toFixed(1)}% de tasa de entrega
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Fallidos</p>
              <p className="text-3xl font-bold text-red-600">{failed}</p>
              {totalSent > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {((failed / totalSent) * 100).toFixed(1)}% de tasa de fallo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mensajes Enviados</CardTitle>
        </CardHeader>
        <CardContent>
          {sentMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-900">No hay mensajes enviados</p>
              <p className="mt-1 text-sm text-gray-500">Los mensajes que envíes aparecerán aquí.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentMessages.map((msg) => (
                <div key={msg.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {msg.recipients.length} destinatario(s)
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(msg.date).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      msg.status === 'Enviado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                  
                  {msg.imageUrl && (
                    <div className="mt-3 mb-2">
                      <img 
                        src={msg.imageUrl} 
                        alt="Imagen enviada" 
                        className="max-h-40 rounded border"
                      />
                    </div>
                  )}
                  
                  {msg.content && (
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <p className="whitespace-pre-wrap text-gray-800">{msg.content}</p>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    {msg.recipients.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ConfiguracionSection() {
  const { config, loading, error, updateConfig } = useConfig()
  const [whatsappToken, setWhatsappToken] = useState(config?.whatsappToken || '')
  const [whatsappPhoneId, setWhatsappPhoneId] = useState(config?.whatsappPhoneId || '')
  const [smtpHost, setSmtpHost] = useState(config?.smtpHost || '')
  const [smtpPort, setSmtpPort] = useState(config?.smtpPort || '')
  const [smtpUser, setSmtpUser] = useState(config?.smtpUser || '')
  const [smtpPass, setSmtpPass] = useState(config?.smtpPass || '')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveResult, setSaveResult] = useState(null)

  // Cerrar sesión de WhatsApp
  const handleWaLogout = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cerrar la sesión de WhatsApp?')) return;
    try {
      const res = await fetch('http://localhost:3001/api/wa-logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Sesión de WhatsApp cerrada. Se generará un nuevo QR al reiniciar.');
      } else {
        alert('No se pudo cerrar la sesión de WhatsApp.');
      }
    } catch (err) {
      console.error('Error cerrando sesión WhatsApp:', err);
      alert('Error cerrando sesión WhatsApp.');
    }
  }

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (config) {
      setWhatsappToken(config.whatsappToken || '')
      setWhatsappPhoneId(config.whatsappPhoneId || '')
      setSmtpHost(config.smtpHost || '')
      setSmtpPort(config.smtpPort || '')
      setSmtpUser(config.smtpUser || '')
      setSmtpPass(config.smtpPass || '')
    }
  }, [config])

  const handleSaveConfig = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    setSaveResult(null)

    try {
      const result = await updateConfig({
        whatsappToken,
        whatsappPhoneId,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass
      })
      setSaveResult(result)
    } catch (err) {
      setSaveResult({ success: false, message: err.message || 'Error al guardar configuración.' })
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando configuración...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
      <div className="mt-2">
        <Button variant="destructive" size="sm" onClick={handleWaLogout} className="flex items-center space-x-2">
          <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión de WhatsApp
        </Button>
      </div>
      <p className="text-gray-600">Configura tus integraciones y preferencias de cuenta.</p>

      <form onSubmit={handleSaveConfig} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Integración WhatsApp Business API</CardTitle>
            <CardDescription>Configura tus credenciales para enviar mensajes por WhatsApp.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsappToken">Token de Acceso</Label>
              <Input
                id="whatsappToken"
                type="password"
                placeholder="Ingresa tu token de acceso de WhatsApp"
                value={whatsappToken}
                onChange={(e) => setWhatsappToken(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappPhoneId">ID de Número de Teléfono</Label>
              <Input
                id="whatsappPhoneId"
                type="text"
                placeholder="Ingresa el ID de tu número de teléfono de WhatsApp"
                value={whatsappPhoneId}
                onChange={(e) => setWhatsappPhoneId(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Email (SMTP)</CardTitle>
            <CardDescription>Configura tus credenciales SMTP para enviar correos electrónicos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">Servidor SMTP</Label>
              <Input
                id="smtpHost"
                type="text"
                placeholder="ej: smtp.gmail.com"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Puerto SMTP</Label>
              <Input
                id="smtpPort"
                type="number"
                placeholder="ej: 587"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpUser">Usuario SMTP</Label>
              <Input
                id="smtpUser"
                type="text"
                placeholder="ej: tu_email@ejemplo.com"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPass">Contraseña SMTP</Label>
              <Input
                id="smtpPass"
                type="password"
                placeholder="Ingresa tu contraseña SMTP"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {saveResult && (
          <Alert variant={saveResult.success ? "default" : "destructive"}>
            {saveResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {saveResult.success 
                ? 'Configuración guardada exitosamente.'
                : saveResult.message}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className="w-full h-11 bg-blue-600 hover:bg-blue-700"
          disabled={saveLoading}
        >
          {saveLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Configuración'
          )}
        </Button>
      </form>
    </div>
  )
}

export default App


