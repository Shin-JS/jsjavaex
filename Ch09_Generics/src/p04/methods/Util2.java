package p04.methods;
/**[제네릭]
 * -.일반클래스-제네릭메소드
 **/
public class Util2 {
	public static<K,V> boolean compare(Pair<K,V> p1,Pair<K,V> p2) {
		boolean keyCompare = p1.getKey().equals(p2.getKey());
		boolean valueCompare = p1.getValue().equals(p2.getValue());
		return keyCompare&&valueCompare;
		//key value
		// T   T : T
		// T   F : F
		// F   T : F
		// F   F : F
	}
}
