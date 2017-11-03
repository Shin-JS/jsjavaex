package p03.privilege;
/** [접근제한자]
 * -.하나의 소스파일에는 여러개의 클래스가 선언가능
 *   단, public으로 선언된 클래스는 하나만 존재하며 클래스명과 소스파일명이 동일해야 한다
 **/
class A { //default 접근제한: 같은 패키지내에서는 public과 동일한 접근권한, 다른 패키지에서는 접근이 불가능하다

}

public class B{ //public: 같은 패키지, 다른 패키지의 모든 객체가 접근 가능, public으로 선언된 클래스는 파일이름과 같아야 한다.
	A a; //동일패키지내의 클래스인 A클래스에서 접근가능
}