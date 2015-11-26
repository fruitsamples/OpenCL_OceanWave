// Version:    <1.0>
//
// Disclaimer: IMPORTANT:  This Apple software is supplied to you by Apple Inc. ("Apple")
//             in consideration of your agreement to the following terms, and your use,
//             installation, modification or redistribution of this Apple software
//             constitutes acceptance of these terms.  If you do not agree with these
//             terms, please do not use, install, modify or redistribute this Apple
//             software.
//
//             In consideration of your agreement to abide by the following terms, and
//             subject to these terms, Apple grants you a personal, non - exclusive
//             license, under Apple's copyrights in this original Apple software ( the
//             "Apple Software" ), to use, reproduce, modify and redistribute the Apple
//             Software, with or without modifications, in source and / or binary forms;
//             provided that if you redistribute the Apple Software in its entirety and
//             without modifications, you must retain this notice and the following text
//             and disclaimers in all such redistributions of the Apple Software. Neither
//             the name, trademarks, service marks or logos of Apple Inc. may be used to
//             endorse or promote products derived from the Apple Software without specific
//             prior written permission from Apple.  Except as expressly stated in this
//             notice, no other rights or licenses, express or implied, are granted by
//             Apple herein, including but not limited to any patent rights that may be
//             infringed by your derivative works or by other works in which the Apple
//             Software may be incorporated.
//
//             The Apple Software is provided by Apple on an "AS IS" basis.  APPLE MAKES NO
//             WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED
//             WARRANTIES OF NON - INFRINGEMENT, MERCHANTABILITY AND FITNESS FOR A
//             PARTICULAR PURPOSE, REGARDING THE APPLE SOFTWARE OR ITS USE AND OPERATION
//             ALONE OR IN COMBINATION WITH YOUR PRODUCTS.
//
//             IN NO EVENT SHALL APPLE BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL OR
//             CONSEQUENTIAL DAMAGES ( INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//             SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//             INTERRUPTION ) ARISING IN ANY WAY OUT OF THE USE, REPRODUCTION, MODIFICATION
//             AND / OR DISTRIBUTION OF THE APPLE SOFTWARE, HOWEVER CAUSED AND WHETHER
//             UNDER THEORY OF CONTRACT, TORT ( INCLUDING NEGLIGENCE ), STRICT LIABILITY OR
//             OTHERWISE, EVEN IF APPLE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Copyright ( C ) 2008 Apple Inc. All Rights Reserved.
//
////////////////////////////////////////////////////////////////////////////////////////////////////

uniform vec4 WaveConstants;
uniform vec4 CameraPosition;
uniform float n;

attribute vec2 Nx;
attribute vec2 Ny;

varying vec3 normal;
varying vec4 pos;
varying mat4 mv;
varying vec2 texcoord;
varying vec4 view;

void main(void) 
{
/*
     texcoord = gl_MultiTexCoord0.xy;
     vec4 texc = vec4(gl_MultiTexCoord0.xy, 0.0, 0.0);
     vec4 Wxy = vec4(WaveConstants.xy, 0.0, 0.0);
     vec4 chopSc = vec4(WaveConstants.zz, WaveConstants.w*n*n, 1.0);
     vec4 pos1 = texc*Wxy + chopSc*gl_Vertex;
     pos = gl_ModelViewMatrix*pos1;
     normal = gl_NormalMatrix*gl_Normal;
     mv = gl_ModelViewMatrix;

     vec4 prj = gl_ProjectionMatrixInverse * gl_Vertex;
     vec4 dir = gl_ModelViewMatrixInverse * vec4(prj.xyz, 0.0);
     view = dir;
    
     gl_Position = gl_ModelViewProjectionMatrix*pos1;
*/

     texcoord = gl_MultiTexCoord0.xy;
     vec4 texc = vec4(gl_MultiTexCoord0.xy, 0.0, 0.0);
     vec4 Wxy = vec4(WaveConstants.xy, 0.0, 0.0);
     vec4 p = vec4(0.0, 0.0, WaveConstants.w*gl_Vertex.w,1.0);
     vec4 pos1 = texc*Wxy + p;
     pos = gl_ModelViewMatrix*pos1;
     normal = gl_NormalMatrix*vec3(Nx.x, Ny.x, 1.0);
     mv = gl_ModelViewMatrix;

     vec4 prj = gl_ProjectionMatrixInverse * gl_Vertex;
     vec4 dir = gl_ModelViewMatrixInverse * vec4(prj.xyz, 0.0);
     view = dir;
    
     gl_Position = gl_ModelViewProjectionMatrix*pos1;


}
