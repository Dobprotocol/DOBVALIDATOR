import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// DOB Protocol ASCII Art Logo
export const DOB_ASCII_ART = `
                       @@@@@@@@@@@@@@                        
                  @@@@@@@@@@@@@@@@@@@@@@@@@@                  
               @@@@@@@@@              @@@@@@@@@               
            @@@@@@@                        @@@@@@@            
          @@@@@@                              @@@@@@          
        @@@@@                                    @@@@@        
       @@@@                                        @@@@@      
     @@@@@                 @@@@@@@@                 @@@@@     
    @@@@               @@@@@@@@@@@@@@@@            @  @@@@    
   @@@@             @@@@@@@@@@@@@@@@@@@@@      @@@@@   @@@@   
   @@@            @@@@@@                   @@@@@@@@@    @@@@  
  @@@@           @@@@@                 @@@@@@@@@         @@@  
 @@@@           @@@@                @@@@@@@@@     @@     @@@@ 
 @@@@          @@@@             @@@@@@@@@     @@@@@@      @@@ 
 @@@          @@@@           @@@@@@@@@     @@@@@@@@@      @@@@
@@@@          @@@@       @@@@@@@@@     @@@@@@@@@@         @@@@
@@@@         @@@@@    @@@@@@@@      @@@@@@@@ @@@@         @@@@
@@@@         @@@@@@@@@@@@@@     @@@@@@@@@    @@@@         @@@@
@@@@         @@@@@@@@@@     @@@@@@@@@       @@@@@         @@@@
 @@@       @@@@@@@@@     @@@@@@@@@          @@@@          @@@@
 @@@      @@@@@@     @@@@@@@@@             @@@@@          @@@ 
 @@@@     @@@     @@@@@@@@@               @@@@@          @@@@ 
  @@@@        @@@@@@@@@                 @@@@@@           @@@  
  @@@@     @@@@@@@@                   @@@@@@            @@@@  
   @@@@   @@@@@@     @@@@@@@@    @@@@@@@@@             @@@@   
    @@@@  @@          @@@@@@@@@@@@@@@@@@              @@@@    
     @@@@@                 @@@@@@@@                 @@@@@     
       @@@@                                        @@@@@      
        @@@@@                                    @@@@@        
          @@@@@                                @@@@@          
            @@@@@@@                        @@@@@@@            
               @@@@@@@@@               @@@@@@@@               
                  @@@@@@@@@@@@@@@@@@@@@@@@@@                  
                       @@@@@@@@@@@@@@@@                       
`

// Stellar Network ASCII Art Logo
export const STELLAR_ASCII_ART = `
                            :..:............:..                        
                   :............................                   
                ...................................:               
             ::.......................................             
           ..:..........................................:          
         .................................................:        
        ..................................................:.       
      .......................................................      
     ..........................................................    
    ......................     ......    ......................:   
   :...................        ......        ....................  
  .:.................          ......          ..................  
  :.................           ......           .................: 
 ..................         ............         .................:
 :................        ................        ...............:.
:................        ........  ........       ................:
:................       ......       ......       .................
.................       .....         .....        ................
.................       ......        .....        ................
:................        ......      ......       .................
:.................       .................        ................:
 .................        ...............        ..................
 :.................         ...........         .................: 
  ..................           ......          ................... 
  :...................         ......         ...................  
   :....................       ......       ....................   
    :.......................   ......   .......................    
     :........................................................     
       .....................................................:      
        ...................................................        
          .:..............................................         
            ...........................................:           
              .:.....................................:             
                 :...............................:.                
                     :........................:                    
                            ::.::::...::                           
`

// Singleton to control ASCII art display
class ASCIIArtController {
  private static instance: ASCIIArtController
  private displayedPages: Set<string> = new Set()
  private lastDisplayTime: number = 0
  private readonly COOLDOWN_MS = 5000 // 5 seconds cooldown between displays

  private constructor() {}

  static getInstance(): ASCIIArtController {
    if (!ASCIIArtController.instance) {
      ASCIIArtController.instance = new ASCIIArtController()
    }
    return ASCIIArtController.instance
  }

  private shouldDisplay(pageId: string): boolean {
    const now = Date.now()
    const hasDisplayed = this.displayedPages.has(pageId)
    const cooldownExpired = now - this.lastDisplayTime > this.COOLDOWN_MS
    
    // Display if:
    // 1. Never displayed on this page, OR
    // 2. Cooldown has expired (for Fast Refresh scenarios)
    return !hasDisplayed || cooldownExpired
  }

  private markDisplayed(pageId: string): void {
    this.displayedPages.add(pageId)
    this.lastDisplayTime = Date.now()
  }

  private getPageId(): string {
    // Use current pathname as page identifier
    return typeof window !== 'undefined' ? window.location.pathname : 'unknown'
  }

  displayDOBArt(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    const pageId = this.getPageId()
    if (!this.shouldDisplay(pageId)) {
      // Just log the message without art during Fast Refresh
      const timestamp = new Date().toISOString()
      const typeEmoji = { info: '🔍', success: '✅', error: '❌', warning: '⚠️' }[type]
      console.log(`${typeEmoji} [${timestamp}] ${message}`)
      return
    }

    this.markDisplayed(pageId)
    const timestamp = new Date().toISOString()
    const typeEmoji = { info: '🔍', success: '✅', error: '❌', warning: '⚠️' }[type]
    
    console.log(`\n${DOB_ASCII_ART}`)
    console.log(`${typeEmoji} [${timestamp}] ${message}`)
    console.log('─'.repeat(80))
  }

  displayStellarArt(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    const pageId = this.getPageId()
    if (!this.shouldDisplay(pageId)) {
      // Just log the message without art during Fast Refresh
      const timestamp = new Date().toISOString()
      const typeEmoji = { info: '🔍', success: '✅', error: '❌', warning: '⚠️' }[type]
      console.log(`${typeEmoji} [${timestamp}] ${message}`)
      return
    }

    this.markDisplayed(pageId)
    const timestamp = new Date().toISOString()
    const typeEmoji = { info: '🔍', success: '✅', error: '❌', warning: '⚠️' }[type]
    
    console.log(`\n${STELLAR_ASCII_ART}`)
    console.log(`${typeEmoji} [${timestamp}] ${message}`)
    console.log('─'.repeat(80))
  }

  displayBothArts(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    const pageId = this.getPageId()
    if (!this.shouldDisplay(pageId)) {
      // Just log the message without art during Fast Refresh
      const timestamp = new Date().toISOString()
      const typeEmoji = { info: '🔍', success: '✅', error: '❌', warning: '⚠️' }[type]
      console.log(`${typeEmoji} [${timestamp}] ${message}`)
      return
    }

    this.markDisplayed(pageId)
    const timestamp = new Date().toISOString()
    const typeEmoji = { info: '🔍', success: '✅', error: '❌', warning: '⚠️' }[type]
    
    console.log(`\n${DOB_ASCII_ART}`)
    console.log(`${STELLAR_ASCII_ART}`)
    console.log(`${typeEmoji} [${timestamp}] ${message}`)
    console.log('─'.repeat(80))
  }

  // Force display (bypass cooldown) - useful for important messages
  forceDisplayBothArts(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    const timestamp = new Date().toISOString()
    const typeEmoji = { info: '🔍', success: '✅', error: '❌', warning: '⚠️' }[type]
    
    console.log(`\n${DOB_ASCII_ART}`)
    console.log(`${STELLAR_ASCII_ART}`)
    console.log(`${typeEmoji} [${timestamp}] ${message}`)
    console.log('─'.repeat(80))
  }

  // Reset display state (useful for testing or manual refresh)
  reset(): void {
    this.displayedPages.clear()
    this.lastDisplayTime = 0
  }
}

// Get singleton instance
const artController = ASCIIArtController.getInstance()

// Utility function to log with DOB ASCII art (controlled display)
export const logWithDOBArt = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  artController.displayDOBArt(message, type)
}

// Utility function to log with Stellar ASCII art (controlled display)
export const logWithStellarArt = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  artController.displayStellarArt(message, type)
}

// Utility function to log with both ASCII arts (controlled display)
export const logWithBothArts = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  artController.displayBothArts(message, type)
}

// Force display both arts (bypasses cooldown)
export const forceDisplayBothArts = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  artController.forceDisplayBothArts(message, type)
}

// Reset art controller (for testing or manual refresh)
export const resetArtController = () => {
  artController.reset()
}
