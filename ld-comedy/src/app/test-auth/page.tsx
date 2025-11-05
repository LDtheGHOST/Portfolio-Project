"use client"

import { useAuth } from "@/hooks/use-auth"
import { RoleGuard, AuthGuard } from "@/components/auth/role-guard"
import { UserProfile, UserBadge, UserStatus } from "@/components/auth/user-profile"
import { AuthButton } from "@/components/auth/auth-button"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { User, Shield, CheckCircle, XCircle } from "lucide-react"

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading, role } = useAuth()
  const [testResults, setTestResults] = useState<any[]>([])

  const runAPITest = async (endpoint: string, method: string = 'GET') => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify({ test: 'data' }) : undefined,
      })
      
      const data = await response.json()
      
      setTestResults(prev => [...prev, {
        endpoint,
        method,
        status: response.status,
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString()
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        endpoint,
        method,
        status: 'Error',
        success: false,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toLocaleTimeString()
      }])
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test d'authentification</h1>
          <p className="text-gray-600">Page de test pour vérifier le système d'authentification LD Comedy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* État de l'authentification */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              État de l'authentification
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Connecté:</span>
                <span className={`flex items-center ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {isAuthenticated ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                  {isAuthenticated ? 'Oui' : 'Non'}
                </span>
              </div>
              
              {isAuthenticated && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Nom:</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rôle:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      role === 'ARTIST' ? 'bg-blue-100 text-blue-800' :
                      role === 'THEATER' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {role}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <UserStatus showRole={true} showEmail={true} />
            </div>
          </Card>

          {/* Composants d'authentification */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Composants d'authentification</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">AuthButton</h3>
                <AuthButton />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">UserProfile</h3>
                <UserProfile />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">UserBadge</h3>
                <UserBadge />
              </div>
            </div>
          </Card>

          {/* Protection par rôle */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Protection par rôle
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Contenu pour les artistes</h3>
                <RoleGuard requiredRole="ARTIST" fallback={<p className="text-red-600 text-sm">Accès refusé - Rôle artiste requis</p>}>
                  <p className="text-green-600 text-sm">✓ Vous avez accès au contenu artiste</p>
                </RoleGuard>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Contenu pour les théâtres</h3>
                <RoleGuard requiredRole="THEATER" fallback={<p className="text-red-600 text-sm">Accès refusé - Rôle théâtre requis</p>}>
                  <p className="text-green-600 text-sm">✓ Vous avez accès au contenu théâtre</p>
                </RoleGuard>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Contenu pour les admins</h3>
                <RoleGuard requiredRole="ADMIN" fallback={<p className="text-red-600 text-sm">Accès refusé - Rôle admin requis</p>}>
                  <p className="text-green-600 text-sm">✓ Vous avez accès au contenu admin</p>
                </RoleGuard>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Contenu pour utilisateurs connectés</h3>
                <AuthGuard fallback={<p className="text-red-600 text-sm">Accès refusé - Connexion requise</p>}>
                  <p className="text-green-600 text-sm">✓ Vous êtes connecté</p>
                </AuthGuard>
              </div>
            </div>
          </Card>

          {/* Tests d'API */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tests d'API</h2>
            
            <div className="space-y-3">
              <Button 
                onClick={() => runAPITest('/api/test-auth', 'GET')}
                className="w-full"
                variant="outline"
              >
                Tester API GET (Artiste requis)
              </Button>
              
              <Button 
                onClick={() => runAPITest('/api/test-auth', 'POST')}
                className="w-full"
                variant="outline"
              >
                Tester API POST (Artiste requis)
              </Button>
              
              <Button 
                onClick={() => setTestResults([])}
                className="w-full"
                variant="secondary"
              >
                Effacer les résultats
              </Button>
            </div>
          </Card>
        </div>

        {/* Résultats des tests */}
        {testResults.length > 0 && (
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Résultats des tests API</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{result.method} {result.endpoint}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                  </div>
                  <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
