#!/usr/bin/python
# -*- coding: utf-8 -*-
# Exibição de imagens
import pygame
import keyboard
import time
import sys
import os
import logging
logging.basicConfig(level=logging.DEBUG)
  

  
# define the RGB value 
# for white colour 
white = (255, 255, 255) 
  
# assigning values to X and Y variable 
X = 1366
Y = 768

# display_surface = pygame.display.set_mode((X,Y))

def show(imagem_src):

  try:
      
    # activate the pygame library . 
    # initiate pygame and give permission 
    # to use pygame's functionality. 
    pygame.init() 
    
    # create the display surface object 
    # of specific dimension..e(X, Y). 
    #display_surface = pygame.display.set_mode((X, Y )) 
          
    # set the pygame window name 
    pygame.display.set_caption('Image') 
    
    existe = os.path.isfile(imagem_src)

    if existe:

        #logging.info('entrou imagem ok')
        
        image = pygame.image.load(imagem_src) 
   
        # centraliza
        x= (1366 - image.get_width()) / 2
        y= (768 - image.get_height()) / 2
       
        display_surface = pygame.display.set_mode((X,Y),pygame.FULLSCREEN)
  
        running = True  
        
        # Exibe por 10 segundos
        timeout = time.time() + 10
        
        # infinite loop 
        while running: 
          
            # completely fill the surface object 
            # with white colour 
            display_surface.fill(white) 
          
            # copying the image surface object 
            # to the display surface object at 
            display_surface.blit(image, (x, y)) 
          
          # iterate over the list of Event objects 
            # that was returned by pygame.event.get() method. 
            for event in pygame.event.get(): 
          
                # if event object type is QUIT 
                # then quitting the pygame 
                # and program both. 
                if event.type == pygame.QUIT : 
          
                    # deactivates the pygame library 
                    pygame.quit() 
          
                    # quit the program. 
                    #quit() 
          
                # Draws the surface object to the screen.   
                pygame.display.update() 
          
            time.sleep(1)
                
            if time.time() > timeout:
               #logging.error('estourou o tempo!') 
               running = False  

            if keyboard.is_pressed('Esc'):
               running = False
         
    else:
       logging.error('Não existe imagem'+imagem_src) 
       
    # deactivates the pygame library 
    pygame.quit() 
    # quit the program. 
    #quit()  
               
  except:
       #e = sys.exc_info()[0]
       #logging.error('Erro ao renderizar imagem'+str(e)+str(sys.exc_info()[1]))
       pygame.quit() 
       # quit the program. 
       #quit()  
       
#show('/home/mindmakers/imgs/1.jpg')      
