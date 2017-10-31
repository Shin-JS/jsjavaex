package collection;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class MyMainList {
	
	public static void main(String[] args) {
		List list = new ArrayList();
		list.add(3);
		list.add(5);
		list.add(1);
		
		
		
		System.out.println(list.get(1));
		System.out.println(list.size());
		System.out.println(list.contains(3));
		System.out.println(list.remove(1));
		
		for (int i = 0; i < list.size(); i++) {
			System.out.println(list.get(i));
		}
		
		Iterator iter = list.iterator();
		while (iter.hasNext()) {
			System.out.println(iter.next());
		}
		
	}

}
