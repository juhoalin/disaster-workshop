"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserRole, UserData } from "@/lib/types"
import { getUser, saveUser, clearUser } from "@/lib/store"

export function JoinForm() {
  const [nickname, setNickname] = useState("")
  const [role, setRole] = useState<UserRole>("User")
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)

  useEffect(() => {
    setCurrentUser(getUser())
  }, [])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (nickname.trim()) {
      const userData: UserData = { nickname: nickname.trim(), role }
      saveUser(userData)
      setCurrentUser(userData)
    }
  }

  const handleLogout = () => {
    clearUser()
    setCurrentUser(null)
  }

  if (currentUser) {
    return (
      <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
        <div className="text-sm">
          <p>
            Posting as <span className="font-bold">{currentUser.nickname}</span>
          </p>
          <p className="text-xs text-muted-foreground">Role: {currentUser.role}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Change User
        </Button>
      </div>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Join the conversation</CardTitle>
        <CardDescription>Choose a nickname and role to start posting anonymously</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Select your role
            </label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Moderator">Moderator</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={!nickname.trim()} className="w-full">
            Join
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

