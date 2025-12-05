# Animación de físicas
## Agustín Alfonso González Iríbar
Animación y minijuego de física realizados con __Three.js__ y __Ammo.js__.

![Imagen de la simulación](assets/readme/sim_completa.png)

## Acceso a la versión web y a vídeo demostrativo

La versión web de este proyecto se encuentra en [este sandbox de codesandbox](https://n6dm25.csb.app/).

El código se puede acceder desde [este enlace](https://codesandbox.io/p/sandbox/animacion-n6dm25).


## Ejecución del proyecto en local

A continuación, se detallan las instrucciones de ejecución del proyecto de forma local en caso de que la version web fallara.

1. Descargar o clonar el repositorio

![Menú de clonación o descarga del repositorio](assets/readme/clonar.png)

2. Descargar e instalar la version mas reciente de ``Node.js`` desde [este enlace](https://nodejs.org/en)

3. Para asegurar que la instalación se realizó correctamente utilizar los siguientes comandos en un terminal o símbolo del sistema:

```
node --version
npm --version
```

4. Una vez correctamente instalado ejecutar el siguiente comando desde un terminal o símbolo del sistema en el directorio o carpeta en el que se encuentre el proyecto:

```
npm install
```

5. Una vez termine el comando anterior ejecutar el siguiente comando desde el mismo terminal o simbolo del sístema:

```
npm run start
```

6. Una vez ejecutado este comando se observará en la consola algo parecido a esto:
```
> animacion-agustin@1.1.0 start
> node server.js

Your app is listening on port 1234
http://localhost:1234
```

7. Abrir un navegador y, en la barra de direcciones, escribir ```localhost:1234``` sustituyendo el 3000 por el número indicado anteriormente.

8. Para terminar la simulación, pulsar la combinación de botones ```Ctrl + C``` en la consola donde se realizó el paso 5

## Estructura del proyecto

La estructura de los archivos del código fuente del proyecto, en el directorio ```src``` es la siguiente:

- Directorio ```modules```: Incluye módulos que se encargan de realizar distintas partes de la aplicación:

    - Directorio ```modules/classes```: Incluye las clases que implementan el control de los inputs de teclado y ratón y la cámara en primera persona.

        - ```FirstPersonCamera.js```: Implementa la cámara en primera persona así como la rotación y traslación de la misma.

        - ```InpurController.js```: Implementra el control de eventos de teclado y ratón.
    
    - ```game.js```: Se encarga de la gestión de la lógica de juego.

    - ```gameObjects.js```: Se encarga de la creación de los objetos de la simulación (plataforma para el jugador, plataforma para los cubos, cubos y bolas).

    - ```gui.js```: Se encarga de la creación de la interfaz de usuario.

    - ```input.js```: Se encarga de la creación y la lógica de los elementos de interacción de la simulación (raycaster e interacciones al hacer clic).

    - ```simObjects.js```: Se encarga de la creación de los objetos de la simulación (escena, cámara, renderer, control órbital, control en primera persona y reloj).

    - ```world.js```: Se encarga de la creación del mundo físico con __Ammo.js__.

- ```animacion.js```: Inicializa __Ammo.js__, inicializa la simulación y controla el bucle de animación.

- ```index.html```: Fichero __HTML__ en el que se muestra la simulación.

- ```ìndex.css```: Hoja de estilos que contiene algunas reglas que mejoran la visualización de la simulación.

## Controles de la simulación
![Controles de la simulación](assets/readme/controles.png)

La simulación incluye dos ``modos de funcionamiento``:
1. Un modo que permite colocar cubos y lanzar bolas con total libertad.
2. Un minijuego consistente en colocar un número determinado de cubos para, posteriormente, tirarlos de la plataforma utilizando un número determinado de bolas.

### Control de botón de colocación o disparo

La interfaz de usuario ofrece la opción de disparar o colocar cubos (según el modo seleccionado en el selector ``Colocar cubos``).

### Modos de funcionamiento de la simulación
#### Colocación de cubos

En este modo se permite la colocación de cubos si la opción ``Colocar cubos`` está seleccionada. Para colocar un cubo simplemente basta con pulsar con el botón derecho del ratón en cualquier punto de la plataforma.

En este modo se puede mover la cámara pulsando el botón izquierdo y arrastrando el ratón.

![Colocación de cubos](assets/readme/cubos.png)

#### Disparo de bolas

Al desmarcar la opción ``Colocar cubos``, la cámara de la simulación cambiará a una cámara en primera persona situada en la plataforma situada alrededor de la plataforma central.

![Cámara en primera persona](assets/readme/primera_persona.png)

Para poder disparar, hay que pulsar con el botón izquierdo del ratón sobre la pantalla, como se indica en la parte superior.

![Indicador de bloqueo de ratón](assets/readme/indicador_bloqueo.png)

Una vez se pulse sobre la pantalla, el navegador bloquerá el ratón dentro de la pantalla para permitir moverlo sin problema. Para salir de este modo basta con pulsar la tecla __Escape__. Esto también lo indica el navegador.

![Indicador de salida de bloqueo de ratón](assets/readme/salida_bloqueo.png)

En el modo de disparo se utilizan los siguientes controles:

- Se puede mover la cámara ```moviendo el ratón``` como en cualquier juego en primera persona.

- Es posible desplazarse por la plataforma utilizando las teclas de movimiento ```W```, ```A```, ```S``` y ```D```.

- Se puede aumentar la velocidad de movimiento pulsando la tecla ```Mayus```.

- Se puede disparar una bola en la dirección en la que se está mirando pulsando el ```botón izquierdo del ratón```.

![Disparo de bolas](assets/readme/bolas.png)

### Contador de objetos

En la parte superior de la pantalla se muestran al usuario el número de cubos y bolas que se encuentran sobre la plataforma.

![Contador de cubos y bolas en la plataforma](assets/readme/contador.png)

### Selectores de sensibilidad del ratón

En la interfaz de usuario se encuentran unos selectores que permiten establecer la sensibilidad, tanto __vertical__ como __horizontal__ del ratón en la cámara en primera persona.

![Selectores de sensibilidad del ratón](assets/readme/sensibilidad.png)

## Minijuego

La simulación incluye un pequeño minijuego consistente en colocar un determinado número de cubos para, posteriormente, sacarlos de la plataforma utilizando un determinado número de bolas.

### Inicio del minijuego

![Controles del juego](assets/readme/control_juego.png)

En la interfaz de usuario se puede seleccionar, en primer lugar, el número de cubos que se deberán colocar al empezar.

Si en la plataforma ya se encontraran un número de cubos superior al número de cubos seleccionado, se jugará con el número de cubos presentes en la plataforma. Por ejemplo, si se seleccionan 25 cubos y en la plataforma hubieran 50 cubos, se jugaría con 50 cubos.

Una vez seleccionado el número de cubos se procede a seleccionar la dificultad. Dicha dificultad afecta al número de disparos que el jugador puede efectuar.

Actualmente el número de bolas se selecciona de la siguiente manera:

1. Dificultad ``fácil``: 75 % del número de cubos
2. Dificultad ``normal``: 50 % del número de cubos
3. Dificultad ``dificil``: 33 % del número de cubos

Una vez se han establecido los parámetros del juego, se pulsa el botón ``Empezar juego`` para inicializar el juego.

### Fase inicial: Colocación de cubos

Si en la plataforma hay menos cubos que los seleccionados por el jugador, entonces deberá colocar los cubos restantes para pasar a la siguiente fase.

![Contador del juego en la fase inicial](assets/readme/contador_fase_1.png)

Además, se informará en la parte superior de la pantalla cuantos cubos quedan por colocar.

### Segunda fase: Lanzamiento de bolas

En esta fase el jugador deberá disparar bolas para expulsar de la plataforma los cubos que colocó previamente.

![Contador del juego en la segunda fase](assets/readme/contador_fase_2.png)

El jugador tendrá un número de disparos limitados determinados por la dificultad y el número de cubos y se le indicaran en la parte superior de la pantalla.

Cuando el jugador expulse todos los cubos, o se quede sin disparos, el juego pasará a la fase final.

### Fase final: muestra de resultados

En esta fase se indicará al jugador si ha ganado o ha perdido en función de si ha podido expulsar todos los cubos de la plataforma con los disparos que tenía.

![Contador del juego en la fase final si el jugador ha ganado](assets/readme/contador_fase_3.png)

![Contador del juego en la fase final si el jugador pierde](assets/readme/contador_fase_3_derrota.png)

Al finalizar, aparece un botón que permite al usuario finalizar la partida y volver al estado inicial de la simulación, en el que puede empezar otra partida.

![Botón de terminar juego](assets/readme/terminar.png)

## Texturas utilizadas

En esta simulación se utilizan las siguientes texturas:

- La textura del SkyBox se puede encontrar [aquí](https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky). Ha sido modificada para poder ser utilizada con [esta herramienta](https://github.com/matheowis/HDRI-to-CubeMap).

- La textura de la plataforma del jugador se puede encontrar [aquí](https://polyhaven.com/a/metal_plate).

- La textura de la plataforma para los cubos se puede encontrar [aquí](https://polyhaven.com/a/concrete_layers_02).

- La textura de los cubos se puede encontrar [aquí](https://polyhaven.com/a/wood_planks).